import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { markDatabaseOrderPaidFromStripe } from "@/lib/database-orders";
import { jsonResponse } from "@/lib/request-protection";

export const runtime = "nodejs";

function getPaymentIntentId(value: Stripe.Checkout.Session["payment_intent"]) {
  if (typeof value === "string") {
    return value;
  }

  return value?.id ?? null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    return;
  }

  const metadata = session.metadata ?? {};

  await markDatabaseOrderPaidFromStripe({
    databaseOrderId: metadata.database_order_id,
    orderNumber: metadata.order_number ?? session.client_reference_id,
    stripePaymentIntentId: getPaymentIntentId(session.payment_intent),
    stripeSessionId: session.id,
  });
}

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!secretKey || !webhookSecret) {
    return jsonResponse({ error: "Service unavailable." }, 503);
  }

  if (!signature) {
    return jsonResponse({ error: "Invalid request." }, 400);
  }

  const stripe = new Stripe(secretKey);
  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return jsonResponse({ error: "Invalid request." }, 400);
  }

  if (event.type === "checkout.session.completed") {
    try {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    } catch (error) {
      console.error(error);

      return jsonResponse({ error: "Webhook processing failed." }, 500);
    }
  }

  return jsonResponse({ received: true });
}

