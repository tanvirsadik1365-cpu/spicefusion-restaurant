import type { SupabaseClient } from "@supabase/supabase-js";
import { sendOrderReadyEmail } from "@/lib/order-notifications";
import { toPence, type CartItem } from "@/lib/order";
import type { ValidatedOrder } from "@/lib/order-validation";
import { saveCustomerProfile } from "@/lib/database-customers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type DatabasePaymentMethod = "cash" | "online";

export type PersistedOrder = {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
};

export type OrderAccountUser = {
  email?: string | null;
  id: string;
};

export type CustomerAccountOrder = {
  cancellationReason: string | null;
  createdAt: string;
  estimatedReadyAt: string | null;
  id: string;
  orderNumber: string;
  orderType: string;
  paymentStatus: string;
  phaseLabel: string;
  prepTimeMinutes: number;
  status: string;
  statusLabel: string;
  totalPence: number;
};

export type MerchantOrderItem = {
  category: string;
  id: string;
  isReward: boolean;
  lineTotalPence: number;
  name: string;
  quantity: number;
};

export type MerchantOrder = {
  acceptedAt: string | null;
  cancellationReason: string | null;
  completedAt: string | null;
  createdAt: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string | null;
  deliveryPostcode: string | null;
  estimatedReadyAt: string | null;
  id: string;
  items: MerchantOrderItem[];
  notes: string | null;
  orderNumber: string;
  orderStatus: string;
  orderType: string;
  paymentMethod: string;
  paymentStatus: string;
  prepTimeMinutes: number;
  readyAt: string | null;
  status: string;
  statusLabel: string;
  totalPence: number;
  updatedAt: string | null;
};

export type MerchantOrderStatusUpdate =
  | "accepted"
  | "ready"
  | "completed"
  | "cancelled";

type DbError = {
  details?: string | null;
  message: string;
};

type UnknownRecord = Record<string, unknown>;
type DateParts = {
  day: number;
  month: number;
  year: number;
};

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readRelatedRecord(row: UnknownRecord, key: string) {
  const value = row[key];

  if (isRecord(value)) {
    return value;
  }

  if (Array.isArray(value) && isRecord(value[0])) {
    return value[0];
  }

  return null;
}

function readRelatedRecords(row: UnknownRecord, key: string) {
  const value = row[key];

  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function getDbErrorMessage(action: string, error?: DbError | null) {
  return `${action}: ${error?.message ?? "Unknown database error."}`;
}

function getRestaurantId() {
  return process.env.RESTAURANT_ID?.trim() || "spicefusion-restaurant";
}

function getRestaurantTimeZone() {
  const timeZone = process.env.RESTAURANT_TIME_ZONE?.trim() || "Europe/London";

  try {
    new Intl.DateTimeFormat("en-GB", { timeZone }).format(new Date());

    return timeZone;
  } catch {
    return "Europe/London";
  }
}

function readString(row: UnknownRecord, key: string) {
  const value = row[key];

  return typeof value === "string" ? value : "";
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

function parseDateInput(value: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { day, month, year };
}

export function isValidMerchantOrderDate(value?: string | null) {
  return Boolean(value && parseDateInput(value));
}

function addCalendarDays(parts: DateParts, days: number): DateParts {
  const date = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day + days),
  );

  return {
    day: date.getUTCDate(),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
  };
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const timeZoneName =
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone,
      timeZoneName: "shortOffset",
    })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT";

  if (timeZoneName === "GMT" || timeZoneName === "UTC") {
    return 0;
  }

  const match = /(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?/.exec(
    timeZoneName,
  );

  if (!match) {
    return 0;
  }

  const direction = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");

  return direction * (hours * 60 + minutes);
}

function getZonedMidnightUtc(parts: DateParts, timeZone: string) {
  const utcGuess = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const firstOffset = getTimeZoneOffsetMinutes(utcGuess, timeZone);
  const firstPass = new Date(utcGuess.getTime() - firstOffset * 60 * 1000);
  const secondOffset = getTimeZoneOffsetMinutes(firstPass, timeZone);

  return new Date(utcGuess.getTime() - secondOffset * 60 * 1000);
}

function getMerchantOrderDateRange(orderDate: string) {
  const dateParts = parseDateInput(orderDate);

  if (!dateParts) {
    return null;
  }

  const timeZone = getRestaurantTimeZone();
  const nextDateParts = addCalendarDays(dateParts, 1);

  return {
    endIso: getZonedMidnightUtc(nextDateParts, timeZone).toISOString(),
    startIso: getZonedMidnightUtc(dateParts, timeZone).toISOString(),
  };
}

function getEffectiveStatus(order: UnknownRecord) {
  const rawStatus = readString(order, "order_status").toLowerCase();

  if (!rawStatus || rawStatus === "new" || rawStatus === "pending") {
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

function getStatusLabel(status: string, orderType = "") {
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
    default:
      return "Pending";
  }
}

function getPhaseLabel(status: string, orderType: string) {
  switch (status) {
    case "pending":
      return "Waiting for restaurant confirmation.";
    case "preparing":
      return "The restaurant accepted your order and is preparing it.";
    case "ready":
      return orderType === "delivery"
        ? "Ready for delivery handoff."
        : "Ready for collection.";
    case "completed":
      return "Order completed.";
    case "cancelled":
      return "Order cancelled.";
    default:
      return "Waiting for restaurant confirmation.";
  }
}

export function createOrderReference() {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `SPICE-${Date.now()}-${suffix}`;
}

function createRewardItems(order: ValidatedOrder): CartItem[] {
  const rewardItems: CartItem[] = [];

  if (order.selectedSideDish) {
    rewardItems.push({
      ...order.selectedSideDish,
      category: "Offer",
      displayName: `Free item - ${order.selectedSideDish.displayName}`,
      name: `Free item - ${order.selectedSideDish.name}`,
      priceLabel: "0",
      quantity: 1,
      unitPrice: 0,
    });
  }

  return rewardItems;
}

function createOrderItemRows(orderId: string, order: ValidatedOrder) {
  const paidItems = order.cartItems.map((item) => ({
    category: item.category,
    is_reward: false,
    line_total_pence: toPence(item.unitPrice * item.quantity),
    menu_item_id: item.id,
    name: item.name,
    order_id: orderId,
    quantity: item.quantity,
    unit_price_pence: toPence(item.unitPrice),
  }));

  const rewardItems = createRewardItems(order).map((item) => ({
    category: item.category,
    is_reward: true,
    line_total_pence: 0,
    menu_item_id: item.id,
    name: item.name,
    order_id: orderId,
    quantity: item.quantity,
    unit_price_pence: 0,
  }));

  return [...paidItems, ...rewardItems];
}

async function addStatusEvent(
  supabase: SupabaseClient,
  orderId: string,
  toStatus: string,
  note: string,
  fromStatus?: string | null,
) {
  const { error } = await supabase.from("order_status_events").insert({
    from_status: fromStatus ?? null,
    note,
    order_id: orderId,
    to_status: toStatus,
  });

  if (error) {
    throw new Error(
      getDbErrorMessage("Order status event could not be saved", error),
    );
  }
}

export async function createDatabaseOrder(
  order: ValidatedOrder,
  paymentMethod: DatabasePaymentMethod,
  user?: OrderAccountUser | null,
  options?: {
    prepTimeMinutes?: number;
  },
): Promise<PersistedOrder> {
  const supabase = getSupabaseAdmin();
  const orderNumber = createOrderReference();
  const prepTimeMinutes = Math.min(
    Math.max(options?.prepTimeMinutes ?? 20, 5),
    120,
  );

  const customerId = await saveCustomerProfile({
    email: order.customer.email,
    name: order.customer.name,
    phone: order.customer.normalizedPhone,
  });

  const { data: databaseOrder, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_auth_user_id: user?.id ?? null,
      customer_id: customerId,
      delivery_address:
        order.orderType === "delivery" ? order.customer.address : null,
      delivery_postcode:
        order.orderType === "delivery" ? order.customer.postcode : null,
      discount_pence: toPence(order.collectionDiscount),
      notes: order.customer.notes || null,
      order_number: orderNumber,
      order_status: "new",
      order_type: order.orderType,
      payment_method: paymentMethod,
      payment_status: paymentMethod === "online" ? "awaiting_payment" : "pending",
      prep_time_minutes: prepTimeMinutes,
      restaurant_id: getRestaurantId(),
      reward_title: order.reward.type === "none" ? null : order.reward.title,
      reward_type: order.reward.type,
      selected_side_dish: order.selectedSideDish?.name ?? null,
      subtotal_pence: toPence(order.subtotal),
      total_pence: toPence(order.total),
    })
    .select("id, order_number, order_status, payment_status")
    .single();

  if (orderError || !databaseOrder) {
    throw new Error(getDbErrorMessage("Order could not be saved", orderError));
  }

  const orderItemRows = createOrderItemRows(databaseOrder.id, order);
  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemRows);

  if (itemsError) {
    throw new Error(
      getDbErrorMessage("Order items could not be saved", itemsError),
    );
  }

  await addStatusEvent(
    supabase,
    databaseOrder.id,
    "new",
    paymentMethod === "online"
      ? "Online checkout started."
      : "Cash order placed.",
  );

  return {
    id: databaseOrder.id,
    orderNumber: databaseOrder.order_number,
    orderStatus: databaseOrder.order_status,
    paymentStatus: databaseOrder.payment_status,
  };
}

const customerOrderSelect =
  "id, order_number, order_status, order_type, payment_status, prep_time_minutes, total_pence, created_at, accepted_at, ready_at, completed_at, cancelled_at, cancellation_reason";

const merchantOrderSelect =
  "id, order_number, order_status, order_type, payment_method, payment_status, delivery_address, delivery_postcode, notes, prep_time_minutes, total_pence, created_at, updated_at, accepted_at, ready_at, completed_at, cancelled_at, cancellation_reason, customers(name, email, phone), order_items(id, name, category, quantity, line_total_pence, is_reward)";

function mapCustomerOrder(row: UnknownRecord): CustomerAccountOrder {
  const status = getEffectiveStatus(row);
  const orderType = readString(row, "order_type") || "collection";
  const prepTimeMinutes = Math.max(readNumber(row, "prep_time_minutes", 20), 1);
  const acceptedAt = readDate(row, "accepted_at");
  const estimatedReadyAt = acceptedAt
    ? addMinutes(acceptedAt, prepTimeMinutes)
    : null;

  return {
    cancellationReason: readNullableString(row, "cancellation_reason"),
    createdAt: readString(row, "created_at"),
    estimatedReadyAt: toIsoString(estimatedReadyAt),
    id: readString(row, "id"),
    orderNumber: readString(row, "order_number"),
    orderType,
    paymentStatus: readString(row, "payment_status") || "pending",
    phaseLabel: getPhaseLabel(status, orderType),
    prepTimeMinutes,
    status,
    statusLabel: getStatusLabel(status, orderType),
    totalPence: readNumber(row, "total_pence", 0),
  };
}

function mapMerchantOrder(row: UnknownRecord): MerchantOrder {
  const status = getEffectiveStatus(row);
  const orderType = readString(row, "order_type") || "collection";
  const prepTimeMinutes = Math.max(readNumber(row, "prep_time_minutes", 20), 1);
  const acceptedAt = readDate(row, "accepted_at");
  const estimatedReadyAt = acceptedAt
    ? addMinutes(acceptedAt, prepTimeMinutes)
    : null;
  const customer = readRelatedRecord(row, "customers") ?? {};
  const items = readRelatedRecords(row, "order_items").map((item) => ({
    category: readString(item, "category"),
    id: readString(item, "id"),
    isReward: item.is_reward === true,
    lineTotalPence: readNumber(item, "line_total_pence", 0),
    name: readString(item, "name"),
    quantity: Math.max(readNumber(item, "quantity", 0), 0),
  }));

  return {
    acceptedAt: toIsoString(acceptedAt),
    cancellationReason: readNullableString(row, "cancellation_reason"),
    completedAt: toIsoString(readDate(row, "completed_at")),
    createdAt: readString(row, "created_at"),
    customerEmail: readString(customer, "email"),
    customerName: readString(customer, "name") || "Guest customer",
    customerPhone: readString(customer, "phone"),
    deliveryAddress: readNullableString(row, "delivery_address"),
    deliveryPostcode: readNullableString(row, "delivery_postcode"),
    estimatedReadyAt: toIsoString(estimatedReadyAt),
    id: readString(row, "id"),
    items,
    notes: readNullableString(row, "notes"),
    orderNumber: readString(row, "order_number"),
    orderStatus: readString(row, "order_status") || "new",
    orderType,
    paymentMethod: readString(row, "payment_method") || "cash",
    paymentStatus: readString(row, "payment_status") || "pending",
    prepTimeMinutes,
    readyAt: toIsoString(readDate(row, "ready_at")),
    status,
    statusLabel: getStatusLabel(status, orderType),
    totalPence: readNumber(row, "total_pence", 0),
    updatedAt: toIsoString(readDate(row, "updated_at")),
  };
}

function isMerchantVisiblePayment(row: UnknownRecord) {
  return (
    readString(row, "payment_method").toLowerCase() !== "online" ||
    readString(row, "payment_status").toLowerCase() === "paid"
  );
}

function assertMerchantOrderStatusUpdate(
  value: string,
): asserts value is MerchantOrderStatusUpdate {
  if (
    value !== "accepted" &&
    value !== "ready" &&
    value !== "completed" &&
    value !== "cancelled"
  ) {
    throw new Error("Choose a valid order status.");
  }
}

function getMerchantStatusNote(status: MerchantOrderStatusUpdate) {
  switch (status) {
    case "accepted":
      return "Order accepted in merchant app.";
    case "ready":
      return "Order marked ready in merchant app.";
    case "completed":
      return "Order completed in merchant app.";
    case "cancelled":
      return "Order cancelled in merchant app.";
  }
}

export async function listCustomerOrders(user: OrderAccountUser) {
  const supabase = getSupabaseAdmin();
  const orderMap = new Map<string, CustomerAccountOrder>();

  const { data: linkedOrders, error: linkedError } = await supabase
    .from("orders")
    .select(customerOrderSelect)
    .eq("customer_auth_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(25);

  if (linkedError) {
    throw new Error(
      getDbErrorMessage("Customer orders could not be loaded", linkedError),
    );
  }

  for (const row of (linkedOrders ?? []) as UnknownRecord[]) {
    const order = mapCustomerOrder(row);
    orderMap.set(order.id, order);
  }

  const email = user.email?.trim().toLowerCase();

  if (email) {
    const { data: customers, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email)
      .limit(10);

    if (customerError) {
      throw new Error(
        getDbErrorMessage("Customer profile could not be loaded", customerError),
      );
    }

    const customerIds = ((customers ?? []) as UnknownRecord[])
      .map((customer) => readString(customer, "id"))
      .filter(Boolean);

    if (customerIds.length > 0) {
      const { data: emailOrders, error: emailOrdersError } = await supabase
        .from("orders")
        .select(customerOrderSelect)
        .in("customer_id", customerIds)
        .order("created_at", { ascending: false })
        .limit(25);

      if (emailOrdersError) {
        throw new Error(
          getDbErrorMessage(
            "Customer email orders could not be loaded",
            emailOrdersError,
          ),
        );
      }

      for (const row of (emailOrders ?? []) as UnknownRecord[]) {
        const order = mapCustomerOrder(row);
        orderMap.set(order.id, order);
      }
    }
  }

  return [...orderMap.values()]
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    )
    .slice(0, 25);
}

export async function listMerchantOrders(options?: {
  orderDate?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  const orderDate = options?.orderDate?.trim() || "";
  let query = supabase
    .from("orders")
    .select(merchantOrderSelect)
    .eq("restaurant_id", getRestaurantId())
    .or("payment_method.neq.online,payment_status.eq.paid")
    .order("created_at", { ascending: false })
    .limit(orderDate ? 500 : 100);

  if (orderDate) {
    const range = getMerchantOrderDateRange(orderDate);

    if (!range) {
      throw new Error("Order date must be in YYYY-MM-DD format.");
    }

    query = query.gte("created_at", range.startIso).lt("created_at", range.endIso);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      getDbErrorMessage("Merchant orders could not be loaded", error),
    );
  }

  return ((data ?? []) as UnknownRecord[]).map(mapMerchantOrder);
}

export async function updateMerchantOrderStatus({
  note,
  orderId,
  status,
}: {
  note?: string | null;
  orderId: string;
  status: string;
}) {
  assertMerchantOrderStatusUpdate(status);

  const supabase = getSupabaseAdmin();
  const { data: order, error: selectError } = await supabase
    .from("orders")
    .select(
      "id, order_status, payment_method, payment_status, accepted_at, ready_at, completed_at, cancelled_at",
    )
    .eq("id", orderId)
    .eq("restaurant_id", getRestaurantId())
    .maybeSingle();

  if (selectError) {
    throw new Error(getDbErrorMessage("Order could not be loaded", selectError));
  }

  if (!order) {
    throw new Error("Order could not be found.");
  }

  const orderRow = order as UnknownRecord;
  const currentStatus = readString(orderRow, "order_status") || "new";
  const shouldSendReadyEmail =
    status === "ready" &&
    currentStatus !== "ready" &&
    !readString(orderRow, "ready_at");

  if (!isMerchantVisiblePayment(orderRow)) {
    throw new Error("Online payment is still awaiting payment.");
  }

  if (currentStatus === "cancelled") {
    throw new Error("Cancelled orders cannot be updated.");
  }

  const now = new Date().toISOString();
  const update: Record<string, unknown> = {
    order_status: status,
    updated_at: now,
  };

  if (status === "accepted") {
    update.accepted_at = readString(orderRow, "accepted_at") || now;
  }

  if (status === "ready") {
    update.accepted_at = readString(orderRow, "accepted_at") || now;
    update.ready_at = readString(orderRow, "ready_at") || now;
  }

  if (status === "completed") {
    update.accepted_at = readString(orderRow, "accepted_at") || now;
    update.ready_at = readString(orderRow, "ready_at") || now;
    update.completed_at = readString(orderRow, "completed_at") || now;
  }

  if (status === "cancelled") {
    update.cancelled_at = readString(orderRow, "cancelled_at") || now;

    if (note?.trim()) {
      update.cancellation_reason = note.trim().slice(0, 500);
    }
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update(update)
    .eq("id", orderId)
    .eq("restaurant_id", getRestaurantId());

  if (updateError) {
    throw new Error(
      getDbErrorMessage("Order status could not be updated", updateError),
    );
  }

  await addStatusEvent(
    supabase,
    readString(orderRow, "id"),
    status,
    note?.trim() || getMerchantStatusNote(status),
    currentStatus,
  );

  const { data: updatedOrder, error: updatedError } = await supabase
    .from("orders")
    .select(merchantOrderSelect)
    .eq("id", orderId)
    .eq("restaurant_id", getRestaurantId())
    .single();

  if (updatedError || !updatedOrder) {
    throw new Error(
      getDbErrorMessage("Updated order could not be loaded", updatedError),
    );
  }

  const mappedOrder = mapMerchantOrder(updatedOrder as UnknownRecord);

  if (shouldSendReadyEmail) {
    try {
      const emailResult = await sendOrderReadyEmail(mappedOrder);

      if (emailResult.sent) {
        await addStatusEvent(
          supabase,
          mappedOrder.id,
          status,
          "Customer ready email sent.",
          status,
        );
      } else if (emailResult.skippedReason) {
        console.warn(emailResult.skippedReason);
      }
    } catch (error) {
      console.error("Order ready email could not be sent.", error);
    }
  }

  return mappedOrder;
}

export async function updateStripeCheckoutSession(
  orderId: string,
  stripeSessionId: string,
) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("orders")
    .update({
      stripe_session_id: stripeSessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    throw new Error(
      getDbErrorMessage("Stripe session could not be saved", error),
    );
  }
}

export async function markDatabaseOrderPaymentFailed(
  orderId: string,
  note: string,
) {
  const supabase = getSupabaseAdmin();
  const { data: order, error: selectError } = await supabase
    .from("orders")
    .select("id, order_status")
    .eq("id", orderId)
    .single();

  if (selectError || !order) {
    throw new Error(
      getDbErrorMessage("Order could not be loaded", selectError),
    );
  }

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    throw new Error(
      getDbErrorMessage("Payment failure could not be saved", error),
    );
  }

  await addStatusEvent(
    supabase,
    order.id,
    order.order_status,
    note,
    order.order_status,
  );
}

export async function markDatabaseOrderPaidFromStripe({
  databaseOrderId,
  orderNumber,
  stripePaymentIntentId,
  stripeSessionId,
}: {
  databaseOrderId?: string | null;
  orderNumber?: string | null;
  stripePaymentIntentId?: string | null;
  stripeSessionId: string;
}) {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("orders")
    .select("id, order_status, payment_status")
    .limit(1);

  if (databaseOrderId) {
    query = query.eq("id", databaseOrderId);
  } else if (stripeSessionId) {
    query = query.eq("stripe_session_id", stripeSessionId);
  } else if (orderNumber) {
    query = query.eq("order_number", orderNumber);
  }

  const { data: order, error: selectError } = await query.single();

  if (selectError || !order) {
    throw new Error(
      getDbErrorMessage("Paid order could not be loaded", selectError),
    );
  }

  const wasAlreadyPaid =
    readString(order as UnknownRecord, "payment_status").toLowerCase() === "paid";

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      stripe_payment_intent_id: stripePaymentIntentId,
      stripe_session_id: stripeSessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (error) {
    throw new Error(
      getDbErrorMessage("Paid order could not be updated", error),
    );
  }

  if (!wasAlreadyPaid) {
    await addStatusEvent(
      supabase,
      order.id,
      order.order_status,
      "Stripe payment confirmed.",
      order.order_status,
    );
  }
}



