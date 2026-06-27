import type { NextRequest } from "next/server";
import Stripe from "stripe";
import { formatCurrency, toPence } from "@/lib/order";
import { restaurant } from "@/lib/restaurant";
import { validateOrderPayload } from "@/lib/order-validation";
import {
  createDatabaseOrder,
  markDatabaseOrderPaymentFailed,
  updateStripeCheckoutSession,
  type PersistedOrder,
} from "@/lib/database-orders";
import { getRequestUser } from "@/lib/database-customers";
import {
  jsonResponse,
  rateLimitRequestSmart,
  rejectDisallowedOrigin,
  rejectSpamSubmission,
} from "@/lib/request-protection";
import { getPublicStoreStatus } from "@/lib/store-status";

export const runtime = "nodejs";

function badRequest(error: string, status = 400) {
  return jsonResponse({ error }, status);
}

function getRequestOrigin(request: NextRequest) {
  return (
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    restaurant.siteUrl
  ).replace(/\/$/, "");
}

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";

  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authorization.slice(7).trim();
}

export async function POST(request: NextRequest) {
  const originError = rejectDisallowedOrigin(request);

  if (originError) {
    return originError;
  }

  const rateLimitError = await rateLimitRequestSmart(request, {
    key: "checkout-post",
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });

  if (rateLimitError) {
    return rateLimitError;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return badRequest("Payment service is temporarily unavailable.", 503);
  }

  const body = await request.json().catch(() => null);
  const spamError = rejectSpamSubmission(body);

  if (spamError) {
    return spamError;
  }

  const validation = validateOrderPayload(body);

  if (!validation.ok) {
    return badRequest(validation.error, validation.status);
  }

  const {
    cartItems,
    collectionDiscount,
    customer,
    customerMode,
    deliveryFee,
    orderType,
    reward,
    selectedSideDish,
    subtotal,
    total,
  } = validation.order;
  const storeStatus = await getPublicStoreStatus();

  if (!storeStatus.orderingAllowed) {
    return badRequest(storeStatus.message, 423);
  }

  const stripe = new Stripe(secretKey);
  type SessionCreateParams = NonNullable<
    Parameters<typeof stripe.checkout.sessions.create>[0]
  >;
  const lineItems: NonNullable<SessionCreateParams["line_items"]> =
    cartItems.map((item) => ({
      price_data: {
        currency: "gbp",
        product_data: {
          name: item.name,
          metadata: {
            category: item.category,
            menu_item_id: item.id,
          },
        },
        unit_amount: toPence(item.unitPrice),
      },
      quantity: item.quantity,
    }));

  if (selectedSideDish) {
    lineItems.push({
      price_data: {
        currency: "gbp",
        product_data: {
          name: `Free item - ${selectedSideDish.name}`,
          metadata: {
            menu_item_id: selectedSideDish.id,
            reward: reward.type,
          },
        },
        unit_amount: 0,
      },
      quantity: 1,
    });
  }

  if (deliveryFee > 0) {
    lineItems.push({
      price_data: {
        currency: "gbp",
        product_data: {
          name: `Delivery charge - ${formatCurrency(deliveryFee)}`,
          metadata: {
            order_type: orderType,
            type: "delivery_fee",
          },
        },
        unit_amount: toPence(deliveryFee),
      },
      quantity: 1,
    });
  }

  const discounts: NonNullable<SessionCreateParams["discounts"]> = [];

  if (collectionDiscount > 0) {
    const directDiscountCouponId =
      orderType === "delivery"
        ? process.env.STRIPE_DELIVERY_COUPON_ID
        : process.env.STRIPE_DIRECT_DISCOUNT_COUPON_ID ||
          process.env.STRIPE_COLLECTION_COUPON_ID;

    if (directDiscountCouponId) {
      discounts.push({ coupon: directDiscountCouponId });
    } else {
      const coupon = await stripe.coupons.create({
        duration: "once",
        name: `${reward.discountPercent}% ${
          orderType === "delivery" ? "delivery" : "collection"
        } discount`,
        percent_off: reward.discountPercent,
      });
      discounts.push({ coupon: coupon.id });
    }
  }

  const origin = getRequestOrigin(request);
  let databaseOrder: PersistedOrder;

  try {
    const user = await getRequestUser(getBearerToken(request));

    databaseOrder = await createDatabaseOrder(validation.order, "online", user, {
      prepTimeMinutes: storeStatus.prepTimeMinutes,
    });
  } catch (error) {
    console.error(error);

    return badRequest("Order could not be created right now.", 503);
  }

  const metadata = {
    cart_lines: JSON.stringify(
      cartItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    ).slice(0, 450),
    customer_mode: customerMode,
    customer_name: customer.name,
    customer_phone: customer.normalizedPhone,
    database_order_id: databaseOrder.id,
    delivery_address:
      orderType === "delivery" ? customer.address.slice(0, 450) : "",
    delivery_fee: toPence(deliveryFee).toString(),
    delivery_postcode: orderType === "delivery" ? customer.postcode : "",
    discount: toPence(collectionDiscount).toString(),
    notes: customer.notes.slice(0, 450),
    order_number: databaseOrder.orderNumber,
    order_type: orderType,
    payment_method: "online",
    reward_type: reward.type,
    reward_title: reward.title,
    selected_side_dish: selectedSideDish?.name ?? "",
    subtotal: toPence(subtotal).toString(),
    total: toPence(total).toString(),
  };

  let session: Stripe.Checkout.Session;

  try {
    session = await stripe.checkout.sessions.create({
      billing_address_collection: "auto",
      cancel_url: `${origin}/checkout/cancel`,
      client_reference_id: databaseOrder.orderNumber,
      customer_email: customer.email,
      discounts: discounts.length > 0 ? discounts : undefined,
      line_items: lineItems,
      metadata,
      mode: "payment",
      payment_intent_data: {
        description: `${restaurant.name} ${orderType} order`,
        metadata,
      },
      phone_number_collection: {
        enabled: true,
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${encodeURIComponent(
        databaseOrder.orderNumber,
      )}`,
    });
  } catch (error) {
    console.error(error);
    await markDatabaseOrderPaymentFailed(
      databaseOrder.id,
      "Stripe checkout could not be created.",
    ).catch(console.error);

    return badRequest("Payment could not be started.", 502);
  }

  if (!session.url) {
    await markDatabaseOrderPaymentFailed(
      databaseOrder.id,
      "Stripe did not return a Checkout URL.",
    ).catch(console.error);

    return badRequest("Checkout could not be started.", 502);
  }

  try {
    await updateStripeCheckoutSession(databaseOrder.id, session.id);
  } catch (error) {
    console.error(error);

    return badRequest("Checkout could not be started.", 502);
  }

  return jsonResponse({
    orderId: databaseOrder.orderNumber,
    url: session.url,
  });
}
