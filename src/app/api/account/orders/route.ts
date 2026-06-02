import type { NextRequest } from "next/server";
import { listCustomerOrders } from "@/lib/database-orders";
import { getRequestUser } from "@/lib/database-customers";
import { jsonResponse, rateLimitRequestSmart } from "@/lib/request-protection";

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

export async function GET(request: NextRequest) {
  const rateLimitError = await rateLimitRequestSmart(request, {
    key: "account-orders-get",
    limit: 30,
    windowMs: 60_000,
  });

  if (rateLimitError) {
    return rateLimitError;
  }

  try {
    const user = await getRequestUser(getBearerToken(request));

    if (!user) {
      return badRequest("Sign in to view orders.", 401);
    }

    const orders = await listCustomerOrders(user);

    return jsonResponse({ orders });
  } catch (error) {
    console.error(error);

    return badRequest("Orders could not be loaded.", 502);
  }
}


