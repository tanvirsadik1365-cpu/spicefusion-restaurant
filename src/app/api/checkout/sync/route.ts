import type { NextRequest } from "next/server";
import Stripe from "stripe";
import { markDatabaseOrderPaidFromStripe } from "@/lib/database-orders";
import {
  jsonResponse,
  rateLimitRequestSmart,
  rejectDisallowedOrigin,
} from "@/lib/request-protection";

export const runtime = "nodejs";

function badRequest(error: string, status = 400) {
  return jsonResponse({ error }, status);
}

function clean(value: unknown, maxLength = 180) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function getPaymentIntentId(value: Stripe.Checkout.Session["payment_intent"]) {
  if (typeof value === "string") {
    return value;
  }

  return value?.id ?? null;
}

function getSessionOrderNumber(session: Stripe.Checkout.Session) {
  return clean(
    session.metadata?.order_number ?? session.client_reference_id ?? "",
    120,
  ).toUpperCase();
}

export async function POST(request: NextRequest) {
  const originError = rejectDisallowedOrigin(request);

  if (originError) {
    return originError;
  }

  const rateLimitError = await rateLimitRequestSmart(request, {
    key: "checkout-sync-post",
    limit: 16,
    windowMs: 5 * 60 * 1000,
  });

  if (rateLimitError) {
    return rateLimitError;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return badRequest("Payment service is temporarily unavailable.", 503);
  }

  const body = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  const sessionId = clean(body?.sessionId, 260);
  const expectedOrderId = clean(body?.orderId, 120).toUpperCase();

  if (!sessionId) {
    return badRequest("Stripe Checkout session is missing.", 422);
  }

  const stripe = new Stripe(secretKey);
  let session: Stripe.Checkout.Session;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });
  } catch (error) {
    console.error(error);

    return badRequest("Payment confirmation could not be loaded.", 502);
  }

  const orderNumber = getSessionOrderNumber(session);

  if (expectedOrderId && orderNumber && expectedOrderId !== orderNumber) {
    return badRequest("Payment confirmation did not match this order.", 409);
  }

  if (session.payment_status !== "paid") {
    return jsonResponse({
      orderId: orderNumber || expectedOrderId,
      paymentStatus: session.payment_status,
    });
  }

  try {
    await markDatabaseOrderPaidFromStripe({
      databaseOrderId: session.metadata?.database_order_id,
      orderNumber: orderNumber || expectedOrderId,
      stripePaymentIntentId: getPaymentIntentId(session.payment_intent),
      stripeSessionId: session.id,
    });
  } catch (error) {
    console.error(error);

    return badRequest("Payment confirmation could not be completed.", 502);
  }

  return jsonResponse({
    orderId: orderNumber || expectedOrderId,
    paymentStatus: "paid",
  });
}

