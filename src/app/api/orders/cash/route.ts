import type { NextRequest } from "next/server";
import { createDatabaseOrder } from "@/lib/database-orders";
import { getRequestUser } from "@/lib/database-customers";
import { validateOrderPayload } from "@/lib/order-validation";
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
    key: "cash-order-post",
    limit: 6,
    windowMs: 10 * 60 * 1000,
  });

  if (rateLimitError) {
    return rateLimitError;
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

  const { order } = validation;
  const storeStatus = await getPublicStoreStatus();

  if (!storeStatus.orderingAllowed) {
    return badRequest(storeStatus.message, 423);
  }

  try {
    const user = await getRequestUser(getBearerToken(request));
    const databaseOrder = await createDatabaseOrder(order, "cash", user, {
      prepTimeMinutes: storeStatus.prepTimeMinutes,
    });

    return jsonResponse({
      databaseOrderId: databaseOrder.id,
      orderId: databaseOrder.orderNumber,
    });
  } catch (error) {
    console.error(error);

    return badRequest("Cash order could not be placed right now.", 502);
  }
}


