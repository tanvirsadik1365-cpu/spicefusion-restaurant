import { normalizeGbPhone } from "@/lib/order";
import { restaurant } from "@/lib/restaurant";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type CustomerTrackingStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type OrderTrackingResult = {
  acceptedAt: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
  createdAt: string | null;
  estimatedReadyAt: string | null;
  orderNumber: string;
  orderType: string;
  paymentStatus: string;
  phaseLabel: string;
  prepTimeMinutes: number;
  readyAt: string | null;
  restaurantSupportPhone: string;
  secondsUntilAutoAccept: number;
  status: CustomerTrackingStatus;
  statusLabel: string;
  totalPence: number;
  updatedAt: string | null;
};

type UnknownRecord = Record<string, unknown>;

type CustomerSummary = {
  email: string;
  phone: string;
};

function clean(value: unknown, maxLength = 180) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function readString(row: UnknownRecord, key: string) {
  const value = row[key];

  return typeof value === "string" ? value : "";
}

function getRestaurantId() {
  return process.env.RESTAURANT_ID?.trim() || "spicefusion-restaurant";
}

function readNullableString(row: UnknownRecord, key: string) {
  const value = readString(row, key).trim();

  return value.length > 0 ? value : null;
}

function readNumber(row: UnknownRecord, key: string, fallback = 0) {
  const value = row[key];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);

    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function readDate(row: UnknownRecord, key: string) {
  const value = readString(row, key);
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function toIsoString(date: Date | null) {
  return date ? date.toISOString() : null;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function getEffectiveStatus(
  order: UnknownRecord,
  _now: Date,
): CustomerTrackingStatus {
  const rawStatus = readString(order, "order_status").toLowerCase();
  const pendingStatuses = new Set(["", "new", "pending"]);

  if (pendingStatuses.has(rawStatus)) {
    return "pending";
  }

  if (rawStatus === "accepted") {
    return "preparing";
  }

  if (
    rawStatus === "preparing" ||
    rawStatus === "ready" ||
    rawStatus === "completed" ||
    rawStatus === "cancelled"
  ) {
    return rawStatus;
  }

  return "pending";
}

function getStatusLabel(status: CustomerTrackingStatus, orderType: string) {
  switch (status) {
    case "pending":
      return "Pending";
    case "preparing":
      return "Accepted / Preparing";
    case "ready":
      return orderType === "delivery" ? "On the way" : "Ready for collection";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
  }
}

function getPhaseLabel(status: CustomerTrackingStatus, orderType: string) {
  switch (status) {
    case "pending":
      return "Waiting for restaurant confirmation.";
    case "preparing":
      return "The restaurant accepted your order and is preparing it.";
    case "ready":
      return orderType === "delivery"
        ? "Your food is on the way. Please be ready to receive your order. Our rider is on the way."
        : "Your food is ready. Please collect your order.";
    case "completed":
      return "Your order is completed.";
    case "cancelled":
      return "This order was cancelled.";
  }
}

function contactMatches(
  contact: string,
  customer: CustomerSummary | null,
  order: UnknownRecord,
) {
  const contactLower = contact.toLowerCase();
  const contactPhone = normalizeGbPhone(contact);
  const email = customer?.email.toLowerCase() ?? "";
  const customerPhone = customer?.phone ? normalizeGbPhone(customer.phone) : "";
  const orderPhone = readString(order, "customer_phone");
  const normalizedOrderPhone = orderPhone ? normalizeGbPhone(orderPhone) : "";

  return (
    Boolean(email && contactLower === email) ||
    Boolean(customerPhone && contactPhone === customerPhone) ||
    Boolean(normalizedOrderPhone && contactPhone === normalizedOrderPhone)
  );
}

async function loadCustomer(customerId: unknown): Promise<CustomerSummary | null> {
  if (!customerId) {
    return null;
  }

  const { data, error } = await getSupabaseAdmin()
    .from("customers")
    .select("email, phone")
    .eq("id", String(customerId))
    .maybeSingle();

  if (error || !data || typeof data !== "object") {
    return null;
  }

  const row = data as UnknownRecord;

  return {
    email: readString(row, "email"),
    phone: readString(row, "phone"),
  };
}

async function loadSupportPhone(restaurantId: string) {
  if (!restaurantId) {
    return restaurant.secondaryPhone || restaurant.phone;
  }

  const { data } = await getSupabaseAdmin()
    .from("restaurant_operations")
    .select("support_phone")
    .eq("restaurant_id", restaurantId)
    .limit(1);

  const row = Array.isArray(data) ? (data[0] as UnknownRecord | undefined) : null;
  const supportPhone = row ? readString(row, "support_phone") : "";

  return supportPhone || restaurant.secondaryPhone || restaurant.phone;
}

export async function findCustomerOrderTracking({
  contact,
  orderNumber,
}: {
  contact: string;
  orderNumber: string;
}): Promise<OrderTrackingResult | null> {
  const cleanOrderNumber = clean(orderNumber, 120).toUpperCase();
  const cleanContact = clean(contact, 180);

  if (!cleanOrderNumber || cleanContact.length < 5) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", cleanOrderNumber)
    .eq("restaurant_id", getRestaurantId())
    .limit(1);

  if (error || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  let order = data[0] as UnknownRecord;
  const customer = await loadCustomer(order.customer_id);

  if (!contactMatches(cleanContact, customer, order)) {
    return null;
  }

  const { data: refreshedData } = await supabase
    .from("orders")
    .select("*")
    .eq("id", String(order.id))
    .eq("restaurant_id", getRestaurantId())
    .limit(1);

  if (Array.isArray(refreshedData) && refreshedData[0]) {
    order = refreshedData[0] as UnknownRecord;
  }

  const now = new Date();
  const status = getEffectiveStatus(order, now);
  const orderType = readString(order, "order_type") || "collection";
  const createdAt = readDate(order, "created_at");
  const acceptedAt = readDate(order, "accepted_at");
  const prepTimeMinutes = Math.max(readNumber(order, "prep_time_minutes", 20), 1);
  const estimatedReadyAt = acceptedAt
    ? addMinutes(acceptedAt, prepTimeMinutes)
    : null;

  return {
    acceptedAt: toIsoString(acceptedAt),
    cancellationReason: readNullableString(order, "cancellation_reason"),
    cancelledAt: toIsoString(readDate(order, "cancelled_at")),
    completedAt: toIsoString(readDate(order, "completed_at")),
    createdAt: toIsoString(createdAt),
    estimatedReadyAt: toIsoString(estimatedReadyAt),
    orderNumber: readString(order, "order_number") || cleanOrderNumber,
    orderType,
    paymentStatus: readString(order, "payment_status") || "pending",
    phaseLabel: getPhaseLabel(status, orderType),
    prepTimeMinutes,
    readyAt: toIsoString(readDate(order, "ready_at")),
    restaurantSupportPhone: await loadSupportPhone(
      readString(order, "restaurant_id"),
    ),
    secondsUntilAutoAccept: 0,
    status,
    statusLabel: getStatusLabel(status, orderType),
    totalPence: readNumber(order, "total_pence", 0),
    updatedAt: toIsoString(readDate(order, "updated_at")),
  };
}

