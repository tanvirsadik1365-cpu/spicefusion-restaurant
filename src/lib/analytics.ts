import { hasTrackingConsent } from "@/lib/consent";
import type { CartItem, OrderType } from "@/lib/order";

export type AnalyticsParams = Record<string, unknown>;

export const LAST_ORDER_TRACKING_KEY = "spice-fusion-last-order-tracking-v1";
export const LEGACY_LAST_ORDER_TRACKING_KEY =
  "Spice Fusion TAKEAWAY-last-order-tracking-v1";
export const ORDER_ANALYTICS_STORAGE_KEY =
  "spice-fusion-last-order-analytics-v1";

type EcommerceItem = {
  item_id: string;
  item_name: string;
  item_category: string;
  price: number;
  quantity: number;
};

export type OrderAnalyticsSnapshot = {
  currency: "GBP";
  item_count: number;
  items: EcommerceItem[];
  order_id: string;
  order_type: OrderType;
  payment_method: string;
  shipping: number;
  tax: number;
  value: number;
};

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: (...args: unknown[]) => void;
  }
}

function pushDataLayer(payload: Record<string, unknown>) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}

export function trackEvent(event: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") {
    return;
  }
  if (!hasTrackingConsent()) {
    return;
  }

  if ("ecommerce" in params) {
    pushDataLayer({ ecommerce: null });
  }

  pushDataLayer({
    event,
    ...params,
  });

  if (typeof window.clarity === "function") {
    window.clarity("event", event);
  }
}

export function trackPageView(pathname: string) {
  trackEvent("page_view", {
    page_location: window.location.href,
    page_path: pathname,
    page_title: document.title,
  });
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

export function toEcommerceItems(items: CartItem[]): EcommerceItem[] {
  return items.map((item) => ({
    item_category: item.category,
    item_id: item.id,
    item_name: item.name,
    price: item.unitPrice,
    quantity: item.quantity,
  }));
}

export function getItemsValue(items: CartItem[]) {
  return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
}

export function trackEcommerceEvent(
  event: string,
  params: Omit<AnalyticsParams, "ecommerce"> & {
    currency?: "GBP";
    items: EcommerceItem[];
    value?: number;
  },
) {
  const { currency = "GBP", items, value, ...rest } = params;

  trackEvent(event, {
    ...rest,
    currency,
    ecommerce: {
      currency,
      items,
      value,
      ...rest,
    },
    items,
    value,
  });
}

export function saveOrderAnalyticsSnapshot(snapshot: OrderAnalyticsSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    ORDER_ANALYTICS_STORAGE_KEY,
    JSON.stringify(snapshot),
  );
}

export function readOrderAnalyticsSnapshot(orderId: string) {
  if (typeof window === "undefined" || !orderId.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(ORDER_ANALYTICS_STORAGE_KEY) ?? "null",
    ) as OrderAnalyticsSnapshot | null;

    return parsed?.order_id === orderId ? parsed : null;
  } catch {
    return null;
  }
}
