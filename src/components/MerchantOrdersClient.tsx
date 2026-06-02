"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  PackageCheck,
  Phone,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { MerchantAppClock } from "@/components/MerchantAppClock";
import { MerchantStoreStatusControl } from "@/components/MerchantStoreStatusControl";
import { formatCurrency } from "@/lib/order";
import type { MerchantOrder } from "@/lib/database-orders";

type MerchantOrdersClientProps = {
  initialError?: string;
  initialOrderDate: string;
  initialOrders: MerchantOrder[];
};

type OrdersResponse = {
  error?: string;
  orders?: MerchantOrder[];
};

type OrderStatusResponse = {
  error?: string;
  order?: MerchantOrder;
};

type MerchantOrderStatusUpdate =
  | "accepted"
  | "ready"
  | "completed"
  | "cancelled";

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDateInput(value: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}

function getTodayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatPence(value: number) {
  return formatCurrency(value / 100);
}

function displayValue(value: string) {
  return value.replace(/-/g, " ");
}

function countsTowardTurnover(order: MerchantOrder) {
  return order.status !== "pending" && order.status !== "cancelled";
}

function MerchantNav() {
  return (
    <nav className="mt-5 flex flex-wrap gap-2">
      <Link
        href="/merchant/orders"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#121212] px-4 text-sm font-black text-white transition hover:bg-[#1F0F06]"
      >
        <ShoppingBag size={16} aria-hidden="true" />
        Orders
      </Link>
    </nav>
  );
}

function getOrderActions(order: MerchantOrder) {
  if (order.status === "cancelled" || order.status === "completed") {
    return [];
  }

  if (order.status === "pending") {
    return [
      { icon: CheckCircle2, label: "Accept", status: "accepted" },
      { icon: XCircle, label: "Cancel", status: "cancelled" },
    ] satisfies Array<{
      icon: typeof CheckCircle2;
      label: string;
      status: MerchantOrderStatusUpdate;
    }>;
  }

  if (order.status === "preparing") {
    return [
      { icon: PackageCheck, label: "Ready", status: "ready" },
      { icon: CheckCircle2, label: "Complete", status: "completed" },
      { icon: XCircle, label: "Cancel", status: "cancelled" },
    ] satisfies Array<{
      icon: typeof CheckCircle2;
      label: string;
      status: MerchantOrderStatusUpdate;
    }>;
  }

  return [
    { icon: CheckCircle2, label: "Complete", status: "completed" },
    { icon: XCircle, label: "Cancel", status: "cancelled" },
  ] satisfies Array<{
    icon: typeof CheckCircle2;
    label: string;
    status: MerchantOrderStatusUpdate;
  }>;
}

function OrderCard({
  actioningStatus,
  onStatusChange,
  order,
}: {
  actioningStatus: string;
  onStatusChange: (orderId: string, status: MerchantOrderStatusUpdate) => void;
  order: MerchantOrder;
}) {
  const actions = getOrderActions(order);

  return (
    <article className="rounded-lg border border-[#cbd5e1] bg-[#ffffff] p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#121212]">
            {order.orderNumber}
          </p>
          <h2 className="mt-2 text-2xl font-black">{order.customerName}</h2>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-[#5F5A53] sm:grid-cols-2">
            <p className="flex items-center gap-2">
              <Clock3 size={15} aria-hidden="true" />
              Placed {formatDateTime(order.createdAt)}
            </p>
            <p className="flex items-center gap-2">
              <CalendarDays size={15} aria-hidden="true" />
              Ready {formatDateTime(order.estimatedReadyAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-[#121212]">
            {order.statusLabel}
          </span>
          <span className="inline-flex rounded-full bg-[#121212] px-3 py-1 text-xs font-black uppercase text-white">
            {formatPence(order.totalPence)}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm leading-6 text-[#5F5A53] md:grid-cols-4">
        <p>
          <span className="font-black text-[#121212]">Type:</span>{" "}
          {displayValue(order.orderType)}
        </p>
        <p>
          <span className="font-black text-[#121212]">Payment:</span>{" "}
          {displayValue(order.paymentMethod)} / {displayValue(order.paymentStatus)}
        </p>
        <p>
          <span className="font-black text-[#121212]">Prep:</span>{" "}
          {order.prepTimeMinutes} min
        </p>
        <p className="flex gap-2">
          <Phone
            className="mt-0.5 shrink-0 text-[#121212]"
            size={17}
            aria-hidden="true"
          />
          {order.customerPhone ? (
            <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a>
          ) : (
            "No phone"
          )}
        </p>
      </div>

      {order.customerEmail ? (
        <p className="mt-3 break-all text-sm leading-6 text-[#5F5A53]">
          <span className="font-black text-[#121212]">Email:</span>{" "}
          {order.customerEmail}
        </p>
      ) : null}

      {order.deliveryAddress || order.notes ? (
        <div className="mt-5 grid gap-3 text-sm leading-6 text-[#5F5A53] md:grid-cols-2">
          {order.deliveryAddress ? (
            <p className="rounded-lg bg-white p-4">
              <span className="font-black text-[#121212]">Delivery:</span>{" "}
              {order.deliveryAddress}
              {order.deliveryPostcode ? `, ${order.deliveryPostcode}` : ""}
            </p>
          ) : null}
          {order.notes ? (
            <p className="rounded-lg bg-white p-4">
              <span className="font-black text-[#121212]">Notes:</span>{" "}
              {order.notes}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 rounded-lg bg-white p-4">
        <p className="text-sm font-black text-[#121212]">Items</p>
        {order.items.length > 0 ? (
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#5F5A53]">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-1 border-t border-[#cbd5e1] pt-2 first:border-t-0 first:pt-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <span>
                  <span className="font-black text-[#121212]">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="block text-xs font-bold uppercase tracking-[0.1em] text-[#121212]">
                    {item.category}
                    {item.isReward ? " / reward" : ""}
                  </span>
                </span>
                <span className="font-black text-[#121212]">
                  {formatPence(item.lineTotalPence)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-6 text-[#5F5A53]">
            No item rows were found for this order.
          </p>
        )}
      </div>

      {order.status === "cancelled" ? (
        <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold leading-6 text-red-900">
          {order.cancellationReason ?? "This order was cancelled."}
        </p>
      ) : null}

      {actions.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            const actionKey = `${order.id}:${action.status}`;
            const isActioning = actioningStatus === actionKey;

            return (
              <button
                key={action.status}
                type="button"
                onClick={() => onStatusChange(order.id, action.status)}
                disabled={Boolean(actioningStatus)}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-black transition disabled:opacity-60 ${
                  action.status === "cancelled"
                    ? "border border-red-200 bg-white text-red-800 hover:bg-red-50"
                    : "bg-[#121212] text-white hover:bg-[#1F0F06]"
                }`}
              >
                <Icon
                  className={isActioning ? "animate-spin" : ""}
                  size={16}
                  aria-hidden="true"
                />
                {isActioning ? "Updating" : action.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}

function OrderSection({
  actioningStatus,
  description,
  onStatusChange,
  orders,
  title,
}: {
  actioningStatus: string;
  description: string;
  onStatusChange: (orderId: string, status: MerchantOrderStatusUpdate) => void;
  orders: MerchantOrder[];
  title: string;
}) {
  if (orders.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-2xl font-black">{title}</h2>
        <p className="mt-1 text-sm font-semibold leading-6 text-[#5F5A53]">
          {description}
        </p>
      </div>
      {orders.map((order) => (
        <OrderCard
          actioningStatus={actioningStatus}
          key={order.id}
          onStatusChange={onStatusChange}
          order={order}
        />
      ))}
    </section>
  );
}

export function MerchantOrdersClient({
  initialError = "",
  initialOrderDate,
  initialOrders,
}: MerchantOrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedDate, setSelectedDate] = useState(initialOrderDate);
  const [loadError, setLoadError] = useState(initialError);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [actioningStatus, setActioningStatus] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const ordersUrl = useMemo(() => {
    const params = new URLSearchParams();

    if (selectedDate) {
      params.set("date", selectedDate);
    }

    const query = params.toString();

    return `/api/merchant/orders${query ? `?${query}` : ""}`;
  }, [selectedDate]);

  const refreshOrders = useCallback(
    async (signal?: AbortSignal) => {
      setRefreshing(true);

      try {
        const response = await fetch(ordersUrl, {
          cache: "no-store",
          signal,
        });
        const result = (await response.json().catch(() => ({}))) as OrdersResponse;

        if (!response.ok) {
          throw new Error(result.error ?? "Orders could not be loaded.");
        }

        setOrders(result.orders ?? []);
        setLoadError("");
        setLastUpdated(new Date());
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setLoadError(
          error instanceof Error ? error.message : "Orders could not be loaded.",
        );
      } finally {
        if (!signal?.aborted) {
          setRefreshing(false);
        }
      }
    },
    [ordersUrl],
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: MerchantOrderStatusUpdate) => {
      const actionKey = `${orderId}:${status}`;

      setActioningStatus(actionKey);
      setLoadError("");

      try {
        const response = await fetch("/api/merchant/orders", {
          body: JSON.stringify({ orderId, status }),
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          method: "PATCH",
        });
        const result = (await response.json().catch(() => ({}))) as
          OrderStatusResponse;

        if (!response.ok || !result.order) {
          throw new Error(result.error ?? "Order status could not be updated.");
        }

        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === result.order?.id ? result.order : order,
          ),
        );
        setLastUpdated(new Date());
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "Order status could not be updated.",
        );
      } finally {
        setActioningStatus("");
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();

    void refreshOrders(controller.signal);
    const timer = window.setInterval(() => {
      void refreshOrders(controller.signal);
    }, 10000);

    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [refreshOrders]);

  useEffect(() => {
    const url = new URL(window.location.href);

    if (selectedDate) {
      url.searchParams.set("date", selectedDate);
    } else {
      url.searchParams.delete("date");
    }

    const query = url.searchParams.toString();

    window.history.replaceState(
      null,
      "",
      `${url.pathname}${query ? `?${query}` : ""}`,
    );
  }, [selectedDate]);

  const pendingOrders = orders.filter((order) => order.status === "pending");
  const activeOrders = orders.filter(
    (order) => order.status === "preparing" || order.status === "ready",
  );
  const finishedOrders = orders.filter(
    (order) => order.status === "completed" || order.status === "cancelled",
  );
  const acceptedTurnoverPence = orders
    .filter(countsTowardTurnover)
    .reduce((total, order) => total + order.totalPence, 0);

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#121212]">
            Merchant App
          </p>
          <h1 className="mt-2 text-4xl font-black">Website orders</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5F5A53]">
            Website checkout orders are stored in Supabase and shown here for
            the restaurant team.
          </p>
          <MerchantNav />
          <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-[#121212]">
            {lastUpdated
              ? `Last checked ${formatDateTime(lastUpdated.toISOString())}`
              : ""}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
          <MerchantAppClock />
          <div className="spice-card rounded-lg px-5 py-4">
            <p className="text-3xl font-black text-[#121212]">
              {orders.length}
            </p>
            <p className="text-sm font-black text-[#5F5A53]">loaded orders</p>
          </div>
          <div className="spice-card rounded-lg px-5 py-4">
            <p className="text-3xl font-black text-[#121212]">
              {pendingOrders.length}
            </p>
            <p className="text-sm font-black text-[#5F5A53]">
              pending acceptance
            </p>
          </div>
          <div className="spice-card rounded-lg px-5 py-4">
            <p className="text-3xl font-black text-[#121212]">
              {formatPence(acceptedTurnoverPence)}
            </p>
            <p className="text-sm font-black text-[#5F5A53]">
              accepted turnover
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refreshOrders()}
            disabled={refreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#121212] px-4 text-sm font-black text-white transition hover:bg-[#1F0F06] disabled:opacity-60 sm:col-span-2"
          >
            <RefreshCw
              className={refreshing ? "animate-spin" : ""}
              size={16}
              aria-hidden="true"
            />
            {refreshing ? "Checking" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <MerchantStoreStatusControl />
      </div>

      <div className="spice-card mt-8 rounded-lg p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <label className="block lg:min-w-72">
            <span className="text-sm font-black text-[#121212]">
              Filter by order date
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-black text-[#121212] outline-none transition focus:border-[#121212] focus:ring-4 focus:ring-[#121212]/10"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedDate(getTodayInputValue())}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#121212]/20 bg-white px-4 text-sm font-black text-[#121212] transition hover:border-[#121212] hover:bg-[#FFF7EC]"
            >
              <CalendarDays size={16} aria-hidden="true" />
              Today
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate("")}
              disabled={!selectedDate}
              className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-black text-[#5F5A53] transition hover:border-[#121212] hover:text-[#121212] disabled:opacity-50"
            >
              All orders
            </button>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold text-[#5F5A53]">
          {selectedDate
            ? `Showing orders placed on ${formatDateInput(selectedDate)}.`
            : "Showing the latest orders across all dates."}
        </p>
      </div>

      {loadError ? (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-black leading-6 text-red-900">
          <div className="flex gap-2">
            <AlertCircle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
            <p>{loadError}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4">
        {orders.length > 0 ? (
          <>
            <OrderSection
              actioningStatus={actioningStatus}
              description="Paid online orders and cash orders wait here until the restaurant accepts them."
              onStatusChange={updateOrderStatus}
              orders={pendingOrders}
              title="Pending orders"
            />
            <OrderSection
              actioningStatus={actioningStatus}
              description="These orders count toward turnover because they have been accepted."
              onStatusChange={updateOrderStatus}
              orders={activeOrders}
              title="Accepted orders"
            />
            <OrderSection
              actioningStatus={actioningStatus}
              description="Completed and cancelled orders for the selected date view."
              onStatusChange={updateOrderStatus}
              orders={finishedOrders}
              title="Finished orders"
            />
          </>
        ) : (
          <div className="spice-card rounded-lg p-8 text-center">
            <ReceiptText
              className="mx-auto text-[#121212]"
              size={42}
              aria-hidden="true"
            />
            <h2 className="mt-5 text-2xl font-black">No orders found</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#5F5A53]">
              Website orders will appear here as soon as customers checkout.
            </p>
          </div>
        )}
      </div>
    </>
  );
}



