import {
  DELIVERY_MINIMUM,
  buildCartItems,
  formatCurrency,
  formatPostcode,
  getActiveReward,
  getCollectionDiscount,
  getDeliveryFee,
  getOrderTotal,
  getSideDishOptions,
  getSubtotal,
  isValidDeliveryPostcode,
  isValidGbPhone,
  normalizeGbPhone,
  type CatalogItem,
  type CartItem,
  type CartLine,
  type CustomerMode,
  type OrderType,
} from "@/lib/order";

export type OrderCustomer = {
  address: string;
  email: string;
  name: string;
  notes: string;
  phone: string;
  postcode: string;
};

export type OrderPayload = {
  customer?: Partial<OrderCustomer>;
  customerMode?: CustomerMode;
  items?: CartLine[];
  orderType?: OrderType;
  selectedSideDishId?: string;
};

export type ValidatedOrder = {
  cartItems: CartItem[];
  collectionDiscount: number;
  customer: OrderCustomer & {
    normalizedPhone: string;
  };
  customerMode: CustomerMode;
  orderType: OrderType;
  reward: ReturnType<typeof getActiveReward>;
  deliveryFee: number;
  selectedSideDish?: CatalogItem;
  subtotal: number;
  total: number;
};

export type OrderValidationResult =
  | {
      ok: true;
      order: ValidatedOrder;
    }
  | {
      error: string;
      ok: false;
      status?: number;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clean(value: unknown, maxLength = 500) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function parseOrderPayload(value: unknown): OrderPayload | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawCustomer = isRecord(value.customer) ? value.customer : {};
  const items = Array.isArray(value.items)
    ? value.items
        .filter(isRecord)
        .map((item) => ({
          id: clean(item.id, 180),
          quantity: Number(item.quantity),
        }))
    : [];

  return {
    customer: {
      address: clean(rawCustomer.address),
      email: clean(rawCustomer.email, 180).toLowerCase(),
      name: clean(rawCustomer.name, 120),
      notes: clean(rawCustomer.notes),
      phone: clean(rawCustomer.phone, 40),
      postcode: clean(rawCustomer.postcode, 20),
    },
    customerMode: value.customerMode === "signin" ? "signin" : "guest",
    items,
    orderType: value.orderType === "delivery" ? "delivery" : "collection",
    selectedSideDishId: clean(value.selectedSideDishId, 180),
  };
}

export function validateOrderPayload(value: unknown): OrderValidationResult {
  const payload = parseOrderPayload(value);

  if (!payload) {
    return { error: "Checkout payload is invalid.", ok: false };
  }

  const customer = payload.customer ?? {};
  const orderType = payload.orderType ?? "collection";
  const customerMode = payload.customerMode ?? "guest";
  const email = customer.email ?? "";
  const phone = customer.phone ?? "";
  const name = customer.name ?? "";
  const address = customer.address ?? "";
  const postcode = customer.postcode ?? "";
  const notes = customer.notes ?? "";
  const cartItems = buildCartItems(payload.items ?? []);

  if (cartItems.length === 0) {
    return {
      error: "Add at least one menu item before checkout.",
      ok: false,
    };
  }

  if (name.length < 2) {
    return { error: "Customer name is required.", ok: false };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "A valid email address is required.", ok: false };
  }

  if (!isValidGbPhone(phone)) {
    return { error: "A valid GB phone number is required.", ok: false };
  }

  const subtotal = getSubtotal(cartItems);
  const reward = getActiveReward(subtotal, orderType);
  const collectionDiscount = getCollectionDiscount(subtotal, reward);
  const deliveryFee = getDeliveryFee(orderType, subtotal);
  const total = getOrderTotal(subtotal, reward, orderType);

  if (orderType === "delivery") {
    if (subtotal < DELIVERY_MINIMUM) {
      return {
        error: `Delivery requires a minimum order of ${formatCurrency(DELIVERY_MINIMUM)}.`,
        ok: false,
      };
    }

    if (!isValidDeliveryPostcode(postcode)) {
      return {
        error: "Delivery is currently available for LS29 area postcodes only.",
        ok: false,
      };
    }

    if (address.length < 6) {
      return { error: "Delivery address is required.", ok: false };
    }
  }

  const sideDishOptions = getSideDishOptions();
  const selectedSideDish =
    reward.requiresSideDish && payload.selectedSideDishId
      ? sideDishOptions.find((item) => item.id === payload.selectedSideDishId)
      : undefined;

  if (reward.requiresSideDish && !selectedSideDish) {
    return {
      error: "Choose a valid free item for this offer.",
      ok: false,
    };
  }

  return {
    ok: true,
    order: {
      cartItems,
      collectionDiscount,
      deliveryFee,
      customer: {
        address,
        email,
        name,
        normalizedPhone: normalizeGbPhone(phone),
        notes,
        phone,
        postcode: orderType === "delivery" ? formatPostcode(postcode) : "",
      },
      customerMode,
      orderType,
      reward,
      selectedSideDish,
      subtotal,
      total,
    },
  };
}
