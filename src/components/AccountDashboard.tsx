"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  CalendarDays,
  Clock,
  LogOut,
  ReceiptText,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import {
  getSupabaseBrowser,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase-browser";
import { formatCurrency } from "@/lib/order";

type CustomerOrder = {
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

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not available yet";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPence(value: number) {
  return formatCurrency(value / 100);
}

function getDateInputValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTodayInputValue() {
  return getDateInputValue(new Date().toISOString());
}

function formatDateInput(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}

export function AccountDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [orderDateFilter, setOrderDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      setError("Customer accounts are not configured yet.");
      setLoading(false);
      return;
    }

    const supabase = getSupabaseBrowser();

    async function loadAccount() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        setLoading(false);
        return;
      }

      setUser(session.user);

      const headers = {
        Authorization: `Bearer ${session.access_token}`,
      };
      const ordersResponse = await fetch("/api/account/orders", { headers });
      const ordersResult = (await ordersResponse.json().catch(() => ({}))) as {
        error?: string;
        orders?: CustomerOrder[];
      };

      if (!ordersResponse.ok) {
        setError(ordersResult.error ?? "Account history could not be loaded.");
      } else {
        setOrders(ordersResult.orders ?? []);
      }

      setLoading(false);
    }

    loadAccount().catch((loadError) => {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Account could not be loaded.",
      );
      setLoading(false);
    });
  }, []);

  async function signOut() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    setUser(null);
    setOrders([]);
    setOrderDateFilter("");
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="spice-card rounded-lg p-8">
          <p className="font-black">Loading your account...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="spice-card rounded-lg p-8 text-center">
          <UserRound className="mx-auto text-[#121212]" size={42} aria-hidden="true" />
          <h1 className="mt-5 text-3xl font-black">Sign in to your account</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#5F5A53]">
            Save your details for faster checkout and see orders linked to your
            account.
          </p>
          {error ? (
            <p className="mx-auto mt-4 max-w-xl rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-black text-red-900">
              {error}
            </p>
          ) : null}
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/account/sign-in"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#121212] px-6 text-sm font-black text-white transition hover:bg-[#1F0F06]"
            >
              Sign in
            </Link>
            <Link
              href="/account/sign-up"
              className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-6 text-sm font-black text-[#121212] transition hover:border-[#121212]"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const filteredOrders = orderDateFilter
    ? orders.filter(
        (order) => getDateInputValue(order.createdAt) === orderDateFilter,
      )
    : orders;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:items-start lg:grid-cols-[0.42fr_1fr]">
        <aside className="spice-card rounded-lg p-6">
          <UserRound className="text-[#121212]" size={34} aria-hidden="true" />
          <h1 className="mt-4 text-3xl font-black">Your account</h1>
          <p className="mt-3 break-all text-sm leading-7 text-[#5F5A53]">
            {user.email}
          </p>
          <div className="mt-7 grid gap-3">
            <Link
              href="/menu"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#121212] px-4 text-sm font-black text-white transition hover:bg-[#1F0F06]"
            >
              <ShoppingBag size={17} aria-hidden="true" />
              Order food
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-black text-[#5F5A53] transition hover:border-[#121212] hover:text-[#121212]"
            >
              <LogOut size={17} aria-hidden="true" />
              Sign out
            </button>
          </div>
        </aside>

        <div className="spice-card rounded-lg p-6">
          <div className="flex items-center gap-2">
            <ReceiptText className="text-[#121212]" size={22} aria-hidden="true" />
            <h2 className="text-2xl font-black">Your orders</h2>
          </div>
          <p className="mt-2 text-sm leading-7 text-[#5F5A53]">
            Food orders linked to this account appear here.
          </p>

          {orders.length > 0 ? (
            <div className="mt-5 rounded-lg border border-[#cbd5e1] bg-[#ffffff] p-4">
              <label className="block">
                <span className="text-sm font-black text-[#121212]">
                  Filter orders by date
                </span>
                <input
                  type="date"
                  value={orderDateFilter}
                  onChange={(event) => setOrderDateFilter(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-black text-[#121212] outline-none transition focus:border-[#121212] focus:ring-4 focus:ring-[#121212]/10"
                />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setOrderDateFilter(getTodayInputValue())}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#121212]/20 bg-white px-4 text-xs font-black uppercase text-[#121212] transition hover:border-[#121212] hover:bg-[#FFF7EC]"
                >
                  <CalendarDays size={15} aria-hidden="true" />
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setOrderDateFilter("")}
                  disabled={!orderDateFilter}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-xs font-black uppercase text-[#5F5A53] transition hover:border-[#121212] hover:text-[#121212] disabled:opacity-50"
                >
                  All
                </button>
              </div>
              <p className="mt-3 text-xs font-black uppercase tracking-[0.1em] text-[#121212]">
                {orderDateFilter
                  ? `${filteredOrders.length} orders on ${formatDateInput(
                      orderDateFilter,
                    )}`
                  : `${orders.length} recent orders`}
              </p>
            </div>
          ) : null}

          {error ? (
            <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-black text-red-900">
              {error}
            </p>
          ) : null}

          <div className="mt-6 grid gap-3">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-lg border border-[#cbd5e1] bg-[#ffffff] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#121212]">
                        {order.orderNumber}
                      </p>
                      <h3 className="mt-2 text-xl font-black">
                        {order.statusLabel}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#5F5A53]">
                        {order.phaseLabel}
                      </p>
                    </div>
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-[#121212]">
                      {formatPence(order.totalPence)}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm">
                    <p className="flex items-center gap-2 text-[#5F5A53]">
                      <Clock size={15} aria-hidden="true" />
                      {order.prepTimeMinutes} min prep
                    </p>
                    <p className="font-semibold text-[#5F5A53]">
                      Ready: {formatDateTime(order.estimatedReadyAt)}
                    </p>
                    <p className="font-semibold capitalize text-[#5F5A53]">
                      {order.orderType} | {order.paymentStatus}
                    </p>
                    <p className="font-semibold text-[#5F5A53]">
                      Ordered: {formatDateTime(order.createdAt)}
                    </p>
                  </div>

                  {order.status === "cancelled" ? (
                    <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold leading-6 text-red-900">
                      {order.cancellationReason ??
                        "The restaurant cancelled this order."}
                    </p>
                  ) : null}

                  <Link
                    href={`/track-order?order_id=${encodeURIComponent(
                      order.orderNumber,
                    )}`}
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-[#121212]/20 bg-white px-4 text-xs font-black uppercase text-[#121212] transition hover:border-[#121212] hover:bg-[#FFF7EC]"
                  >
                    Full tracking
                  </Link>
                </article>
              ))
            ) : orderDateFilter ? (
              <div className="rounded-lg border border-[#cbd5e1] bg-[#ffffff] p-6 text-sm leading-7 text-[#5F5A53]">
                No orders found for {formatDateInput(orderDateFilter)}.
              </div>
            ) : (
              <div className="rounded-lg border border-[#cbd5e1] bg-[#ffffff] p-6 text-sm leading-7 text-[#5F5A53]">
                No orders saved to this account yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}





