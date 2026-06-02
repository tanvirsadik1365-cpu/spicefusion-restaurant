import type { NextRequest } from "next/server";
import { findCustomerOrderTracking } from "@/lib/order-tracking";
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

export async function POST(request: NextRequest) {
  const originError = rejectDisallowedOrigin(request);

  if (originError) {
    return originError;
  }

  const rateLimitError = await rateLimitRequestSmart(request, {
    key: "order-tracking-post",
    limit: 24,
    windowMs: 5 * 60 * 1000,
  });

  if (rateLimitError) {
    return rateLimitError;
  }

  const body = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  const orderNumber = clean(body?.orderNumber, 120);
  const contact = clean(body?.contact, 180);

  if (!orderNumber || !contact) {
    return badRequest("Enter your order number and phone or email.", 422);
  }

  try {
    const tracking = await findCustomerOrderTracking({
      contact,
      orderNumber,
    });

    if (!tracking) {
      return badRequest(
        "Order could not be found. Check the order number and phone or email.",
        404,
      );
    }

    return jsonResponse({ tracking });
  } catch (error) {
    console.error(error);

    return badRequest("Order tracking could not load. Please try again.", 502);
  }
}

