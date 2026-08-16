import { menuSections } from "@/lib/restaurant";

export type OrderType = "collection" | "delivery";
export type CustomerMode = "guest" | "signin";

export type CatalogItem = {
  id: string;
  name: string;
  displayName: string;
  category: string;
  priceLabel: string;
  unitPrice: number;
};

export type CartLine = {
  id: string;
  quantity: number;
};

export type CartItem = CatalogItem & {
  quantity: number;
};

export type RewardType =
  | "none"
  | "direct-discount";

export type ActiveReward = {
  discountPercent: number;
  type: RewardType;
  title: string;
  detail: string;
  requiresSideDish: boolean;
};

export const COLLECTION_MINIMUM = 20;
export const DELIVERY_MINIMUM = 20;
export const DELIVERY_BASE_FEE = 3;
export const DELIVERY_POSTCODE_PREFIXES = ["LS29"] as const;

export const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function parseFirstPrice(value: string) {
  const firstPrice = value.split("/")[0]?.trim() ?? "0";
  return Number.parseFloat(firstPrice) || 0;
}

export function toPence(value: number) {
  return Math.round(value * 100);
}

export function getCatalogItems(): CatalogItem[] {
  const sectionItems = menuSections.flatMap((section) =>
    section.items.map((item) => ({
      id: `${section.id}-${item.name}`,
      name: item.name,
      displayName: item.name,
      category: section.title,
      priceLabel: item.price,
      unitPrice: parseFirstPrice(item.price),
    })),
  );

  return sectionItems;
}

export function getCatalogMap() {
  return new Map(getCatalogItems().map((item) => [item.id, item]));
}

export function buildCartItems(lines: CartLine[]) {
  const catalog = getCatalogMap();
  const merged = new Map<string, number>();

  for (const line of lines) {
    if (!line.id || !Number.isFinite(line.quantity)) {
      continue;
    }

    const quantity = Math.max(0, Math.min(Math.floor(line.quantity), 99));

    if (quantity > 0) {
      merged.set(line.id, (merged.get(line.id) ?? 0) + quantity);
    }
  }

  return Array.from(merged.entries())
    .map(([id, quantity]) => {
      const item = catalog.get(id);

      if (!item) {
        return null;
      }

      return { ...item, quantity };
    })
    .filter((item): item is CartItem => item !== null);
}

export function getSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
}

export function getActiveReward(subtotal: number, orderType: OrderType): ActiveReward {
  if (subtotal >= COLLECTION_MINIMUM && orderType === "collection") {
    return {
      type: "direct-discount",
      discountPercent: 15,
      title: "15% Collection Discount",
      detail: "Spice Fusion TAKEAWAY collection reward for direct collection orders.",
      requiresSideDish: false,
    };
  }

  if (subtotal >= DELIVERY_MINIMUM && orderType === "delivery") {
    return {
      type: "direct-discount",
      discountPercent: 10,
      title: "10% Delivery Discount",
      detail: "Spice Fusion TAKEAWAY delivery reward for direct delivery orders.",
      requiresSideDish: false,
    };
  }

  return {
    type: "none",
    discountPercent: 0,
    title: "No reward yet",
    detail:
      orderType === "collection"
        ? "Minimum spend £20 and unlock 15% OFF collection offer."
        : "Delivery is available from £20 minimum. £3 within a 5-mile radius, then +£1 per mile (up to 7 miles).",
    requiresSideDish: false,
  };
}

export function getCollectionDiscount(subtotal: number, reward: ActiveReward) {
  return reward.type === "direct-discount"
    ? subtotal * (reward.discountPercent / 100)
    : 0;
}

export function getDeliveryFee(orderType: OrderType, subtotal: number) {
  return orderType === "delivery" && subtotal > 0 ? DELIVERY_BASE_FEE : 0;
}

export function getOrderTotal(
  subtotal: number,
  reward: ActiveReward,
  orderType: OrderType = "collection",
) {
  return Math.max(
    subtotal - getCollectionDiscount(subtotal, reward) + getDeliveryFee(orderType, subtotal),
    0,
  );
}

export function getSideDishOptions() {
  return getCatalogItems().filter(
    (item) => item.category === "Vegetable Side Dishes",
  );
}

export function normalizeGbPhone(value: string) {
  const compact = value.replace(/[\s().-]/g, "");

  if (compact.startsWith("+44")) {
    const rest = compact.slice(3);
    return `0${rest.replace(/^0/, "")}`;
  }

  if (compact.startsWith("0044")) {
    const rest = compact.slice(4);
    return `0${rest.replace(/^0/, "")}`;
  }

  return compact;
}

export function isValidGbPhone(value: string) {
  const normalized = normalizeGbPhone(value);

  return /^0(?:1\d{8,9}|2\d{8,9}|3\d{8,9}|7\d{9}|8\d{8,9})$/.test(
    normalized,
  );
}

export function formatPostcode(value: string) {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (compact.length <= 3) {
    return compact;
  }

  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

export function isValidDeliveryPostcode(value: string) {
  const formatted = formatPostcode(value);

  if (!/^[A-Z]{1,2}\d[A-Z\d]?\s\d[A-Z]{2}$/.test(formatted)) {
    return false;
  }

  return DELIVERY_POSTCODE_PREFIXES.includes(
    formatted.split(" ")[0] as (typeof DELIVERY_POSTCODE_PREFIXES)[number],
  );
}
