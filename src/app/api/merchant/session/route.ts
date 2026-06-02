import { NextResponse, type NextRequest } from "next/server";
import {
  clearMerchantSessionCookie,
  isMerchantAuthConfigured,
  isValidMerchantToken,
  setMerchantSessionCookie,
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

export async function POST(request: NextRequest) {
  const originError = rejectDisallowedOrigin(request);

  if (originError) {
    return originError;
  }

  const rateLimitError = await rateLimitRequestSmart(request, {
    key: "merchant-session",
    limit: 6,
    windowMs: 15 * 60 * 1000,
  });

  if (rateLimitError) {
    return rateLimitError;
  }

  if (!isMerchantAuthConfigured()) {
    return jsonResponse({ error: "Merchant access is not configured." }, 503);
  }

  const body = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  const token = typeof body?.token === "string" ? body.token : "";

  if (!isValidMerchantToken(token)) {
    return jsonResponse({ error: "Merchant access token is invalid." }, 401);
  }

  const response = jsonResponse({ ok: true });
  setMerchantSessionCookie(response);

  return response;
}

export async function DELETE(request: NextRequest) {
  const originError = rejectDisallowedOrigin(request);

  if (originError) {
    return originError;
  }

  const rateLimitError = await rateLimitRequestSmart(request, {
    key: "merchant-session-delete",
    limit: 20,
    windowMs: 15 * 60 * 1000,
  });

  if (rateLimitError) {
    return rateLimitError;
  }

  const response = jsonResponse({ ok: true });
  clearMerchantSessionCookie(response);

  return response;
}

