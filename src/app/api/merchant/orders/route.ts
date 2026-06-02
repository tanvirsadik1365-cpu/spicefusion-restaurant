import { NextResponse, type NextRequest } from "next/server";
import {
  isValidMerchantOrderDate,
  listMerchantOrders,
  updateMerchantOrderStatus,
} from "@/lib/database-orders";
import {
  isMerchantAuthConfigured,
  isMerchantRequestAuthorized,
} from "@/lib/merchant-auth";
import {
  rateLimitRequestSmart,
  rejectDisallowedOrigin,
} from "@/lib/request-protection";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    headers: noStoreHeaders,
    status,
  });
}

export async function GET(request: NextRequest) {
  const rateLimitError = await rateLimitRequestSmart(request, {
    key: "merchant-orders-get",
    limit: 90,
    windowMs: 60_000,
  });

  if (rateLimitError) {
    return rateLimitError;
  }

  const tokenError = validateMerchantToken(request);

  if (tokenError) {
    return tokenError;
  }

  const orderDate = request.nextUrl.searchParams.get("date")?.trim() || "";

  if (orderDate && !isValidMerchantOrderDate(orderDate)) {
    return jsonResponse({ error: "Choose a valid order date." }, 400);
  }

  try {
    const orders = await listMerchantOrders({ orderDate });

    return jsonResponse({ orders });
  } catch (error) {
    console.error(error);

    return jsonResponse({ error: "Orders could not be loaded." }, 502);
  }
}

function validateMerchantToken(request: NextRequest) {
  if (!isMerchantAuthConfigured()) {
    return jsonResponse({ error: "Merchant access is unavailable." }, 503);
  }

  if (!isMerchantRequestAuthorized(request)) {
    return jsonResponse({ error: "Merchant session is invalid." }, 401);
  }

  return null;
}

function clean(value: unknown, maxLength = 500) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function PATCH(request: NextRequest) {
  const originError = rejectDisallowedOrigin(request);

  if (originError) {
    return originError;
  }

  const rateLimitError = await rateLimitRequestSmart(request, {
    key: "merchant-orders-patch",
    limit: 40,
    windowMs: 60_000,
  });

  if (rateLimitError) {
    return rateLimitError;
  }

  const tokenError = validateMerchantToken(request);

  if (tokenError) {
    return tokenError;
  }

  const body = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  const orderId = clean(body?.orderId, 120);
  const status = clean(body?.status, 40);
  const note = clean(body?.note, 500);

  if (!orderId || !status) {
    return jsonResponse({ error: "Choose an order and status." }, 422);
  }

  try {
    const order = await updateMerchantOrderStatus({
      note,
      orderId,
      status,
    });

    return jsonResponse({ order });
  } catch (error) {
    console.error(error);

    return jsonResponse({ error: "Order status could not be updated." }, 422);
  }
}

