export const COOKIE_CONSENT_KEY = "spice-fusion-cookie-consent-v1";

export type CookieConsent = "accepted" | "rejected";

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  return value === "accepted" || value === "rejected" ? value : null;
}

export function hasTrackingConsent() {
  return readCookieConsent() === "accepted";
}


