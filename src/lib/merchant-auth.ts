import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export const merchantSessionCookieName = "spice_fusion_merchant_session";

const merchantSessionMaxAgeSeconds = 60 * 60 * 12;
const merchantSessionMessage = "spice-fusion-merchant-session-v1";

function getExpectedMerchantToken() {
  return process.env.MERCHANT_DASHBOARD_TOKEN?.trim() ?? "";
}

function safeEquals(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

function createMerchantSessionValue(expectedToken: string) {
  return createHmac("sha256", expectedToken)
    .update(merchantSessionMessage)
    .digest("hex");
}

function isValidMerchantSessionValue(value: string | undefined) {
  const expectedToken = getExpectedMerchantToken();

  if (!expectedToken || !value) {
    return false;
  }

  return safeEquals(value, createMerchantSessionValue(expectedToken));
}

export function isValidMerchantToken(token: string) {
  const expectedToken = getExpectedMerchantToken();

  if (!expectedToken || !token.trim()) {
    return false;
  }

  return safeEquals(token.trim(), expectedToken);
}

export function isMerchantAuthConfigured() {
  return Boolean(getExpectedMerchantToken());
}

export async function isMerchantPageAuthorized() {
  const cookieStore = await cookies();

  return isValidMerchantSessionValue(
    cookieStore.get(merchantSessionCookieName)?.value,
  );
}

export function isMerchantRequestAuthorized(request: NextRequest) {
  return isValidMerchantSessionValue(
    request.cookies.get(merchantSessionCookieName)?.value,
  );
}

export function setMerchantSessionCookie(response: NextResponse) {
  const expectedToken = getExpectedMerchantToken();

  if (!expectedToken) {
    return;
  }

  response.cookies.set(
    merchantSessionCookieName,
    createMerchantSessionValue(expectedToken),
    {
      httpOnly: true,
      maxAge: merchantSessionMaxAgeSeconds,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    },
  );
}

export function clearMerchantSessionCookie(response: NextResponse) {
  response.cookies.set(merchantSessionCookieName, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}



