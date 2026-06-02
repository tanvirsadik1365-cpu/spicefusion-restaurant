import type { NextRequest } from "next/server";
import { getRequestUser, saveCustomerProfile } from "@/lib/database-customers";
import { isValidGbPhone, normalizeGbPhone } from "@/lib/order";
import {
  jsonResponse,
  rateLimitRequestSmart,
  rejectDisallowedOrigin,
  rejectSpamSubmission,
} from "@/lib/request-protection";

export const runtime = "nodejs";

function badRequest(error: string, status = 400) {
  return jsonResponse({ error }, status);
}

function clean(value: unknown, maxLength = 500) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
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
    key: "account-profile-post",
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });

  if (rateLimitError) {
    return rateLimitError;
  }

  try {
    const user = await getRequestUser(getBearerToken(request));

    if (!user?.email) {
      return badRequest("Sign in before saving customer details.", 401);
    }

    const body = await request.json().catch(() => null);
    const spamError = rejectSpamSubmission(body);

    if (spamError) {
      return spamError;
    }

    const name = clean(body?.name, 120);
    const phone = clean(body?.phone, 40);

    if (name.length < 2) {
      return badRequest("Full name is required.");
    }

    if (!isValidGbPhone(phone)) {
      return badRequest("A valid UK phone number is required.");
    }

    const customerId = await saveCustomerProfile({
      email: user.email,
      name,
      phone: normalizeGbPhone(phone),
    });

    return jsonResponse({ customerId });
  } catch (error) {
    console.error(error);

    return badRequest("Customer details could not be saved.", 502);
  }
}


