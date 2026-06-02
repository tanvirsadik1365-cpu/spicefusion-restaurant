import { hasTrackingConsent } from "@/lib/consent";
export type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") {
    return;
  }
  if (!hasTrackingConsent()) {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event,
    ...params,
  });
}

export function trackPageView(pathname: string) {
  trackEvent("page_view", { page_path: pathname });
}

export function trackMetaEvent(eventName: string, params: AnalyticsParams = {}) {
  if (
    typeof window === "undefined" ||
    !hasTrackingConsent() ||
    typeof window.fbq !== "function"
  ) {
    return;
  }

  window.fbq("track", eventName, params);
}

