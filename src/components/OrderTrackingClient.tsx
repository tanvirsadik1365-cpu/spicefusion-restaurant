"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  Clock,
  Hash,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  Timer,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { restaurant } from "@/lib/restaurant";
import type { OrderTrackingResult } from "@/lib/order-tracking";

type LookupDetails = {
  contact: string;
  orderNumber: string;
};

type TrackingResponse = {
  error?: string;
  tracking?: OrderTrackingResult;
};

const terminalStatuses = new Set(["completed", "cancelled"]);

const statusSteps = [
  { id: "pending", label: "Pending", text: "Restaurant confirmation" },
  { id: "preparing", label: "Accepted / Preparing", text: "Kitchen is preparing" },
  { id: "ready", label: "Ready", text: "Ready or on the way" },
  { id: "completed", label: "Completed", text: "Order finished" },
] as const;

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not available yet";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatShortTime(value: string | null) {
  if (!value) {
    return "Pending";
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCurrencyFromPence(value: number) {
  return new Intl.NumberFormat("en-GB", {
    currency: "GBP",
    style: "currency",
  }).format(value / 100);
}

function phoneHref(value: string) {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}

function statusTone(status: OrderTrackingResult["status"]) {
  switch (status) {
    case "pending":
      return "border-[#E52B2B]/35 bg-[#E52B2B]/12 text-[#F4B400]";
    case "preparing":
      return "border-sky-300/25 bg-sky-400/10 text-sky-100";
    case "ready":
      return "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";
    case "completed":
      return "border-white/12 bg-white/8 text-white";
    case "cancelled":
      return "border-red-400/30 bg-red-500/10 text-red-100";
  }
}

function statusAccent(status: OrderTrackingResult["status"]) {
  switch (status) {
    case "pending":
      return "bg-[#E52B2B] text-white";
    case "preparing":
      return "bg-sky-300 text-sky-950";
    case "ready":
      return "bg-emerald-300 text-emerald-950";
    case "completed":
      return "bg-white text-[#121212]";
    case "cancelled":
      return "bg-red-400 text-white";
  }
}

function compactStatusText(tracking: OrderTrackingResult) {
  if (tracking.status === "cancelled" && tracking.cancellationReason) {
    return tracking.cancellationReason;
  }

  return tracking.phaseLabel;
}

export function OrderTrackingClient() {
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastLookup, setLastLookup] = useState<LookupDetails | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [tracking, setTracking] = useState<OrderTrackingResult | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialOrder =
      params.get("order_id") ??
      params.get("order") ??
      params.get("orderNumber") ??
      "";

    if (initialOrder) {
      setOrderNumber(initialOrder);
    }
  }, []);

  const runLookup = useCallback(
    async (lookup: LookupDetails, silent = false) => {
      if (!lookup.orderNumber.trim() || !lookup.contact.trim()) {
        setError("Enter your order number and phone or email.");
        return;
      }

      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError("");

      try {
        const response = await fetch("/api/orders/track", {
          body: JSON.stringify(lookup),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        const payload = (await response.json().catch(() => ({}))) as TrackingResponse;

        if (!response.ok || !payload.tracking) {
          throw new Error(payload.error ?? "Order tracking could not load.");
        }

        setTracking(payload.tracking);
        setLastLookup(lookup);
      } catch (lookupError) {
        if (!silent) {
          setTracking(null);
        }
        setError(
          lookupError instanceof Error
            ? lookupError.message
            : "Order tracking could not load.",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!lastLookup || !tracking || terminalStatuses.has(tracking.status)) {
      return;
    }

    const interval = window.setInterval(() => {
      void runLookup(lastLookup, true);
    }, 15000);

    return () => window.clearInterval(interval);
  }, [lastLookup, runLookup, tracking]);

  const activeStepIndex = useMemo(() => {
    if (!tracking || tracking.status === "cancelled") {
      return -1;
    }

    return statusSteps.findIndex((step) => step.id === tracking.status);
  }, [tracking]);

  const progressPercent =
    activeStepIndex < 0
      ? 0
      : Math.min(100, (activeStepIndex / (statusSteps.length - 1)) * 100);

  const orderTypeLabel = tracking?.orderType
    ? tracking.orderType === "delivery"
      ? "Delivery"
      : "Collection"
    : "Collection or delivery";

  return (
    <section className="relative isolate overflow-hidden bg-[#F5F5F5] px-4 pb-24 pt-8 text-[#121212] sm:px-6 lg:px-8 lg:py-12">
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#FFFFFF_0%,#F5F5F5_58%,#F5F5F5_100%)]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="track-order-hero-grid"
        >
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#cbd5e1] bg-[#ffffff] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#E52B2B] shadow-[0_14px_34px_rgba(18,18,18,0.1)]">
              <ClipboardList size={15} aria-hidden="true" />
              Live order tracking
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] sm:text-6xl lg:text-7xl">
              Follow your order from kitchen to your table.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#5F5A53]">
              Enter your order number and checkout contact to see the current
              status, prep time, payment status, and Spice Fusion support details.
            </p>
          </div>

          <div className="rounded-2xl border border-[#cbd5e1] bg-[#ffffff] p-5 shadow-[0_24px_70px_rgba(18,18,18,0.14)]">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E52B2B] text-white">
                <ShieldCheck size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-black text-[#121212]">Private lookup</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#5F5A53]">
                  Tracking opens only when the order number and phone or email
                  match the order.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="track-order-layout mt-8">
          <aside className="rounded-2xl border border-[#cbd5e1] bg-[#ffffff] p-5 shadow-[0_24px_70px_rgba(18,18,18,0.12)] sm:p-6 lg:sticky lg:top-28">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E52B2B]">
                  Find order
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#121212]">Track your order</h2>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#cbd5e1] bg-[#F5F5F5] text-[#E52B2B]">
                <Search size={20} aria-hidden="true" />
              </span>
            </div>

            <form
              className="mt-6 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void runLookup({ contact, orderNumber });
              }}
            >
              <label className="grid gap-2 text-sm font-black text-[#121212]">
                Order number
                <span className="relative block">
                  <Hash
                    className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#8B7B66]"
                    size={18}
                    aria-hidden="true"
                  />
                  <input
                    value={orderNumber}
                    onChange={(event) => setOrderNumber(event.target.value)}
                    className="h-12 min-h-12 w-full rounded-lg border border-[#cbd5e1] bg-[#F5F5F5] pl-14 pr-4 text-sm font-black uppercase text-[#121212] outline-none transition placeholder:text-[#8B7B66] focus:border-[#E52B2B]/70 focus:ring-4 focus:ring-[#E52B2B]/12"
                    placeholder="SPICE-..."
                    autoComplete="off"
                  />
                </span>
              </label>

              <label className="grid gap-2 text-sm font-black text-[#121212]">
                Phone or email
                <span className="relative block">
                  <Mail
                    className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#8B7B66]"
                    size={18}
                    aria-hidden="true"
                  />
                  <input
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    className="h-12 min-h-12 w-full rounded-lg border border-[#cbd5e1] bg-[#F5F5F5] pl-14 pr-4 text-sm font-bold text-[#121212] outline-none transition placeholder:text-[#8B7B66] focus:border-[#E52B2B]/70 focus:ring-4 focus:ring-[#E52B2B]/12"
                    placeholder="Phone number or email"
                    autoComplete="email"
                  />
                </span>
              </label>

              {error ? (
                <p className="rounded-lg border border-red-400/25 bg-red-500/10 p-3 text-sm font-black leading-6 text-red-100">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-12 min-h-12 items-center justify-center gap-2 rounded-full bg-[#E52B2B] px-6 text-sm font-black text-white shadow-[0_16px_36px_rgba(229,43,43,0.2)] transition hover:-translate-y-0.5 hover:bg-[#f7d477] disabled:cursor-not-allowed disabled:bg-[#d9d0c2] disabled:text-[#6f6657]"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                ) : (
                  <Search size={18} aria-hidden="true" />
                )}
                {isLoading ? "Checking order..." : "Track order"}
              </button>
            </form>

            <div className="mt-5 rounded-lg border border-[#cbd5e1] bg-[#F5F5F5] p-4">
              <p className="text-sm font-black text-[#121212]">Need help?</p>
              <a
                href={restaurant.phoneHref}
                className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#cbd5e1] bg-[#ffffff] px-4 text-sm font-black text-[#E52B2B] transition hover:border-[#E52B2B]/60"
              >
                <Phone size={16} aria-hidden="true" />
                {restaurant.phone}
              </a>
            </div>

            <Link
              href="/menu"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#cbd5e1] bg-[#F5F5F5] px-4 text-sm font-black text-[#3F3932] transition hover:border-[#E52B2B]/60 hover:text-[#121212]"
            >
              Back to menu
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </aside>

          <div className="grid gap-5">
            {tracking ? (
              <>
                <article
                  className={`rounded-lg border p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] ${statusTone(
                    tracking.status,
                  )}`}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] opacity-80">
                        {tracking.orderNumber}
                      </p>
                      <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                        {tracking.statusLabel}
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm font-bold leading-7 opacity-75">
                        {compactStatusText(tracking)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        lastLookup ? void runLookup(lastLookup, true) : undefined
                      }
                      disabled={isRefreshing || !lastLookup}
                      className="inline-flex h-11 min-h-11 items-center justify-center gap-2 rounded-full border border-current/20 bg-black/18 px-4 text-sm font-black transition hover:bg-black/28 disabled:opacity-60"
                    >
                      <RefreshCw
                        className={isRefreshing ? "animate-spin" : ""}
                        size={16}
                        aria-hidden="true"
                      />
                      Refresh
                    </button>
                  </div>
                </article>

                <article className="overflow-hidden rounded-2xl border border-[#cbd5e1] bg-[#ffffff] p-5 shadow-[0_24px_70px_rgba(18,18,18,0.12)] sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E52B2B]">
                        Order progress
                      </p>
                      <h2 className="mt-2 text-2xl font-black">Kitchen timeline</h2>
                    </div>
                    <div className="rounded-full border border-[#cbd5e1] bg-[#F5F5F5] px-4 py-2 text-sm font-black text-[#5F5A53]">
                      Auto-refreshes every 15 sec
                    </div>
                  </div>

                  {tracking.status === "cancelled" ? (
                    <div className="mt-6 rounded-lg border border-red-400/25 bg-red-500/10 p-4 text-red-100">
                      <div className="flex items-start gap-3">
                        <XCircle className="mt-0.5 shrink-0" size={22} aria-hidden="true" />
                        <div>
                          <p className="font-black">Order cancelled</p>
                          <p className="mt-1 text-sm font-bold leading-6 text-red-100/76">
                            {tracking.cancellationReason ??
                              "The restaurant cancelled this order."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <div
                        className="relative hidden h-2 rounded-full bg-[#e5e7eb] sm:block"
                        aria-hidden="true"
                      >
                        <span
                          className="absolute left-0 top-0 h-full rounded-full bg-[#E52B2B] transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <ol className="mt-5 grid gap-3 sm:grid-cols-4">
                        {statusSteps.map((step, index) => {
                          const complete = activeStepIndex >= index;
                          const active = activeStepIndex === index;

                          return (
                            <li
                              key={step.id}
                              className={`rounded-lg border p-4 ${
                                complete
                                  ? "border-[#E52B2B]/40 bg-[#E52B2B]/10"
                                  : "border-[#cbd5e1] bg-[#F5F5F5]"
                              }`}
                            >
                              <span
                                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                                  complete
                                    ? statusAccent(tracking.status)
                                    : "bg-[#e5e7eb] text-[#7D7467]"
                                }`}
                              >
                                {complete ? <CheckCircle2 size={18} /> : index + 1}
                              </span>
                              <p className="mt-3 text-sm font-black leading-5 text-[#121212]">
                                {step.label}
                              </p>
                              <p className="mt-1 text-xs font-semibold leading-5 text-[#6E6558]">
                                {step.text}
                              </p>
                              {active ? (
                                <p className="mt-2 text-xs font-black uppercase tracking-wide text-[#E52B2B]">
                                  Current
                                </p>
                              ) : null}
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  )}
                </article>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-lg border border-[#cbd5e1] bg-[#ffffff] p-4">
                    <Timer className="text-[#E52B2B]" size={21} aria-hidden="true" />
                    <p className="mt-4 text-xs font-black uppercase tracking-wide text-[#E52B2B]">
                      Prep time
                    </p>
                    <p className="mt-2 text-2xl font-black">
                      {tracking.prepTimeMinutes} min
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#cbd5e1] bg-[#ffffff] p-4">
                    <Clock className="text-[#E52B2B]" size={21} aria-hidden="true" />
                    <p className="mt-4 text-xs font-black uppercase tracking-wide text-[#E52B2B]">
                      Estimated ready
                    </p>
                    <p className="mt-2 text-2xl font-black">
                      {formatShortTime(tracking.estimatedReadyAt)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#6E6558]">
                      {formatDateTime(tracking.estimatedReadyAt)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#cbd5e1] bg-[#ffffff] p-4">
                    <Store className="text-[#E52B2B]" size={21} aria-hidden="true" />
                    <p className="mt-4 text-xs font-black uppercase tracking-wide text-[#E52B2B]">
                      Order type
                    </p>
                    <p className="mt-2 text-2xl font-black">{orderTypeLabel}</p>
                  </div>
                  <div className="rounded-lg border border-[#cbd5e1] bg-[#ffffff] p-4">
                    <BadgeCheck className="text-[#E52B2B]" size={21} aria-hidden="true" />
                    <p className="mt-4 text-xs font-black uppercase tracking-wide text-[#E52B2B]">
                      Payment
                    </p>
                    <p className="mt-2 text-2xl font-black capitalize">
                      {tracking.paymentStatus.replaceAll("_", " ")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#cbd5e1] bg-[#ffffff] p-4">
                    <ClipboardList className="text-[#E52B2B]" size={21} aria-hidden="true" />
                    <p className="mt-4 text-xs font-black uppercase tracking-wide text-[#E52B2B]">
                      Total
                    </p>
                    <p className="mt-2 text-2xl font-black">
                      {formatCurrencyFromPence(tracking.totalPence)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#E52B2B]/24 bg-[#E52B2B]/10 p-4">
                    <Phone className="text-[#E52B2B]" size={21} aria-hidden="true" />
                    <p className="mt-4 text-xs font-black uppercase tracking-wide text-[#E52B2B]">
                      Spice Fusion support
                    </p>
                    <a
                      href={phoneHref(tracking.restaurantSupportPhone)}
                      className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#E52B2B] px-4 text-sm font-black text-white transition hover:bg-white hover:text-[#121212]"
                    >
                      {tracking.restaurantSupportPhone}
                    </a>
                  </div>
                </div>

                <article className="rounded-2xl border border-[#cbd5e1] bg-[#ffffff] p-5 shadow-[0_20px_58px_rgba(18,18,18,0.1)] sm:p-6">
                  <h2 className="text-xl font-black">Order help</h2>
                  <p className="mt-2 text-sm font-semibold leading-7 text-[#5F5A53]">
                    For allergy, timing, delivery, or payment questions, call the
                    restaurant and quote your order number.
                  </p>
                </article>
              </>
            ) : (
              <article className="min-h-[520px] rounded-2xl border border-[#cbd5e1] bg-[#ffffff] p-6 shadow-[0_24px_70px_rgba(18,18,18,0.12)] sm:p-8">
                <div className="flex h-full flex-col justify-between gap-8">
                  <div>
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E52B2B] text-white shadow-[0_16px_34px_rgba(229,43,43,0.18)]">
                      <ClipboardList size={25} aria-hidden="true" />
                    </span>
                    <h2 className="mt-6 max-w-xl text-3xl font-black leading-tight sm:text-4xl">
                      Your live order status will appear here.
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-[#5F5A53]">
                      After lookup, this page updates automatically while the
                      order is active.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ["1", "Enter order number"],
                      ["2", "Add phone or email"],
                      ["3", "Watch live status"],
                    ].map(([number, label]) => (
                      <div
                        key={number}
                        className="rounded-lg border border-[#cbd5e1] bg-[#F5F5F5] p-4"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-black text-[#E52B2B]">
                          {number}
                        </span>
                        <p className="mt-3 text-sm font-black text-[#121212]">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}



