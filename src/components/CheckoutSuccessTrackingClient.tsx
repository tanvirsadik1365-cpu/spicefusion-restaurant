"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Phone,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import type { OrderTrackingResult } from "@/lib/order-tracking";
import {
  LAST_ORDER_TRACKING_KEY,
  LEGACY_LAST_ORDER_TRACKING_KEY,
  readOrderAnalyticsSnapshot,
  trackEcommerceEvent,
  trackEvent,
  trackMetaEvent,
} from "@/lib/analytics";

type LookupDetails = {
  contact: string;
  orderNumber: string;
};

type StoredTrackingLookup = Partial<LookupDetails> & {
  savedAt?: string;
};

type TrackingResponse = {
  error?: string;
  tracking?: OrderTrackingResult;
};

type CheckoutSyncResponse = {
  error?: string;
  orderId?: string;
  paymentStatus?: string;
};

type PaymentSyncState = "idle" | "checking" | "confirmed" | "pending" | "error";

const terminalStatuses = new Set(["completed", "cancelled"]);

const progressSteps = [
  { id: "pending", label: "Pending" },
  { id: "preparing", label: "Accepted / Preparing" },
  { id: "ready", label: "Ready" },
  { id: "completed", label: "Completed" },
] as const;

function clean(value: string | null) {
  return value?.trim() ?? "";
}

function readStoredTrackingLookup(): StoredTrackingLookup | null {
  try {
    const stored =
      window.localStorage.getItem(LAST_ORDER_TRACKING_KEY) ??
      window.localStorage.getItem(LEGACY_LAST_ORDER_TRACKING_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as StoredTrackingLookup;

    return {
      contact: clean(parsed.contact ?? null),
      orderNumber: clean(parsed.orderNumber ?? null),
      savedAt: clean(parsed.savedAt ?? null),
    };
  } catch {
    return null;
  }
}

function phoneHref(value: string) {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}

function formatReadyTime(value: string | null) {
  if (!value) {
    return "Not available yet";
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getHeadline(tracking: OrderTrackingResult) {
  switch (tracking.status) {
    case "pending":
      return "Waiting for restaurant confirmation";
    case "preparing":
      return "Accepted, preparing now";
    case "ready":
      return tracking.orderType === "delivery"
        ? "Your food is on the way"
        : "Your food is ready";
    case "completed":
      return "Order completed";
    case "cancelled":
      return "Order cancelled";
  }
}

function getDetailLine(tracking: OrderTrackingResult) {
  switch (tracking.status) {
    case "pending":
      return "Waiting for the restaurant to accept your order.";
    case "preparing":
      return `Estimated ready at ${formatReadyTime(tracking.estimatedReadyAt)}`;
    case "ready":
      return tracking.orderType === "delivery"
        ? "Please be ready to receive your order. Our rider is on the way."
        : "Please collect your order from the restaurant.";
    case "completed":
      return "Thank you for ordering.";
    case "cancelled":
      return tracking.cancellationReason ?? "The restaurant cancelled this order.";
  }
}

function trackingHref(orderNumber: string) {
  return orderNumber
    ? `/track-order?order_id=${encodeURIComponent(orderNumber)}`
    : "/track-order";
}

export function CheckoutSuccessTrackingClient() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lookup, setLookup] = useState<LookupDetails | null>(null);
  const [manualOrderNumber, setManualOrderNumber] = useState("");
  const [paymentSyncMessage, setPaymentSyncMessage] = useState("");
  const [paymentSyncState, setPaymentSyncState] =
    useState<PaymentSyncState>("idle");
  const [tracking, setTracking] = useState<OrderTrackingResult | null>(null);
  const [purchaseTracked, setPurchaseTracked] = useState(false);
  const [orderCompleteTracked, setOrderCompleteTracked] = useState(false);

  const syncStripeCheckoutSession = useCallback(
    async (sessionId: string, orderNumber: string) => {
      if (!sessionId) {
        return orderNumber;
      }

      setPaymentSyncState("checking");
      setPaymentSyncMessage("Confirming card payment...");

      try {
        const response = await fetch("/api/checkout/sync", {
          body: JSON.stringify({
            orderId: orderNumber,
            sessionId,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        const payload = (await response.json().catch(() => ({}))) as
          CheckoutSyncResponse;

        if (!response.ok) {
          throw new Error(payload.error ?? "Payment confirmation failed.");
        }

        const syncedOrderNumber = clean(payload.orderId ?? null) || orderNumber;

        if (payload.paymentStatus === "paid") {
          setPaymentSyncState("confirmed");
          setPaymentSyncMessage("Card payment confirmed.");
        } else {
          setPaymentSyncState("pending");
          setPaymentSyncMessage(
            "Card payment is still being confirmed. Please refresh shortly.",
          );
        }

        return syncedOrderNumber;
      } catch (syncError) {
        setPaymentSyncState("error");
        setPaymentSyncMessage(
          syncError instanceof Error
            ? syncError.message
            : "Payment confirmation failed.",
        );

        return orderNumber;
      }
    },
    [],
  );

  const runLookup = useCallback(
    async (nextLookup: LookupDetails, silent = false) => {
      if (!nextLookup.orderNumber || !nextLookup.contact) {
        setError("");
        setIsLoading(false);
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
          body: JSON.stringify(nextLookup),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        const payload = (await response.json().catch(() => ({}))) as TrackingResponse;

        if (!response.ok || !payload.tracking) {
          throw new Error(payload.error ?? "Order tracking could not load.");
        }

        setLookup(nextLookup);
        setTracking(payload.tracking);
      } catch (lookupError) {
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
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const orderFromUrl =
      clean(params.get("order_id")) ||
      clean(params.get("order")) ||
      clean(params.get("orderNumber"));
    const sessionId = clean(params.get("session_id"));
    const stored = readStoredTrackingLookup();
    const orderNumber = orderFromUrl || stored?.orderNumber || "";
    const contact = stored?.contact || "";

    setManualOrderNumber(orderNumber);

    async function loadOrder() {
      const syncedOrderNumber = await syncStripeCheckoutSession(
        sessionId,
        orderNumber,
      );

      if (!active) {
        return;
      }

      if (syncedOrderNumber && syncedOrderNumber !== orderNumber) {
        setManualOrderNumber(syncedOrderNumber);
      }

      if (!syncedOrderNumber || !contact) {
        setIsLoading(false);
        return;
      }

      void runLookup({ contact, orderNumber: syncedOrderNumber });
    }

    void loadOrder();

    return () => {
      active = false;
    };
  }, [runLookup, syncStripeCheckoutSession]);

  useEffect(() => {
    if (!lookup || !tracking || terminalStatuses.has(tracking.status)) {
      return;
    }

    const interval = window.setInterval(() => {
      void runLookup(lookup, true);
    }, 15000);

    return () => window.clearInterval(interval);
  }, [lookup, runLookup, tracking]);

  useEffect(() => {
    if (!tracking || purchaseTracked) {
      return;
    }

    const orderSnapshot = readOrderAnalyticsSnapshot(tracking.orderNumber);

    if (orderSnapshot) {
      trackEcommerceEvent("purchase", {
        affiliation: "Spice Fusion TAKEAWAY website",
        currency: orderSnapshot.currency,
        items: orderSnapshot.items,
        order_type: orderSnapshot.order_type,
        payment_type: orderSnapshot.payment_method,
        shipping: orderSnapshot.shipping,
        tax: orderSnapshot.tax,
        transaction_id: orderSnapshot.order_id,
        value: orderSnapshot.value,
      });
    } else {
      trackEvent("purchase", {
        order_id: tracking.orderNumber,
        order_status: tracking.status,
        payment_method: tracking.paymentStatus ?? "unknown",
        order_type: tracking.orderType,
        currency: "GBP",
        value: tracking.totalPence / 100,
      });
    }

    trackMetaEvent("Purchase", {
      currency: "GBP",
      value: tracking.totalPence / 100,
      order_id: tracking.orderNumber,
    });

    setPurchaseTracked(true);
  }, [purchaseTracked, tracking]);

  useEffect(() => {
    if (!tracking || orderCompleteTracked || tracking.status !== "completed") {
      return;
    }

    trackEvent("order_complete", {
      order_id: tracking.orderNumber,
      order_type: tracking.orderType,
      currency: "GBP",
      value: tracking.totalPence / 100,
    });
    setOrderCompleteTracked(true);
  }, [orderCompleteTracked, tracking]);

  const activeStepIndex = useMemo(() => {
    if (!tracking || tracking.status === "cancelled") {
      return -1;
    }

    return progressSteps.findIndex((step) => step.id === tracking.status);
  }, [tracking]);

  const orderNumber = tracking?.orderNumber ?? manualOrderNumber;

  return (
    <main className="bg-[#121212] px-4 py-12 text-white sm:px-6 lg:px-8 lg:py-16">
      <section className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-white/10 bg-[#1A1A1A] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.36)] sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CheckCircle2 className="text-[#E52B2B]" size={46} aria-hidden="true" />
              <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#E52B2B]">
                Checkout complete
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
                {orderNumber ? `Order ${orderNumber} received` : "Order received"}
              </h1>
            </div>

            {tracking ? (
              <button
                type="button"
                onClick={() => (lookup ? void runLookup(lookup, true) : undefined)}
                disabled={!lookup || isRefreshing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 text-sm font-black text-white transition hover:border-[#E52B2B]/55 hover:text-[#F4B400] disabled:opacity-60"
              >
                <RefreshCw
                  className={isRefreshing ? "animate-spin" : ""}
                  size={16}
                  aria-hidden="true"
                />
                Refresh
              </button>
            ) : null}
          </div>

          {paymentSyncState !== "idle" ? (
            <div
              className={`mt-6 flex items-center gap-3 rounded-lg border p-4 text-sm font-black ${
                paymentSyncState === "error"
                  ? "border-red-400/35 bg-red-500/10 text-red-100"
                  : paymentSyncState === "confirmed"
                    ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-50"
                    : "border-[#E52B2B]/25 bg-[#E52B2B]/10 text-white/70"
              }`}
            >
              {paymentSyncState === "checking" ? (
                <Loader2
                  className="animate-spin text-[#E52B2B]"
                  size={18}
                  aria-hidden="true"
                />
              ) : paymentSyncState === "confirmed" ? (
                <CheckCircle2 size={18} aria-hidden="true" />
              ) : (
                <Clock size={18} aria-hidden="true" />
              )}
              <p>{paymentSyncMessage}</p>
            </div>
          ) : null}

          {isLoading ? (
            <div className="mt-8 flex items-center gap-3 rounded-lg border border-white/10 bg-white/6 p-4 text-sm font-black text-white/62">
              <Loader2 className="animate-spin text-[#E52B2B]" size={19} aria-hidden="true" />
              Loading live order tracking...
            </div>
          ) : tracking ? (
            <div className="mt-8 grid gap-6">
              <div
                className={`rounded-lg border p-5 ${
                  tracking.status === "cancelled"
                    ? "border-red-400/35 bg-red-500/10 text-red-100"
                    : "border-[#E52B2B]/25 bg-[#E52B2B]/10"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-[#E52B2B]">
                      Live status
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      {getHeadline(tracking)}
                    </h2>
                    <p className="mt-2 text-sm font-bold leading-6 text-white/62">
                      {getDetailLine(tracking)}
                    </p>
                  </div>
                  {tracking.status === "cancelled" ? (
                    <XCircle size={34} aria-hidden="true" />
                  ) : (
                    <Clock size={34} className="text-[#E52B2B]" aria-hidden="true" />
                  )}
                </div>
              </div>

              {tracking.status === "cancelled" ? (
                <div className="rounded-lg border border-red-400/35 bg-red-500/10 p-4 text-sm font-bold leading-6 text-red-100">
                  {tracking.cancellationReason ??
                    "The restaurant cancelled this order."}
                </div>
              ) : (
                <ol className="grid gap-3 sm:grid-cols-4">
                  {progressSteps.map((step, index) => {
                    const complete = activeStepIndex >= index;
                    const active = activeStepIndex === index;

                    return (
                      <li
                        key={step.id}
                        className={`rounded-lg border p-4 ${
                          complete
                            ? "border-[#E52B2B]/45 bg-[#E52B2B]/10"
                            : "border-white/10 bg-white/6"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${
                            complete
                              ? "bg-[#E52B2B] text-white"
                              : "bg-white/12 text-white/50"
                          }`}
                        >
                          {complete ? <CheckCircle2 size={17} /> : index + 1}
                        </span>
                        <p className="mt-3 text-sm font-black leading-5">
                          {step.label}
                        </p>
                        {active ? (
                          <p className="mt-1 text-xs font-black uppercase tracking-wide text-[#E52B2B]">
                            Current
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              )}

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/6 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-[#E52B2B]">
                    Prep time
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {tracking.prepTimeMinutes} min
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/6 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-[#E52B2B]">
                    Estimated ready
                  </p>
                  <p className="mt-2 text-xl font-black">
                    {formatReadyTime(tracking.estimatedReadyAt)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/6 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-[#E52B2B]">
                    Spice Fusion support
                  </p>
                  <a
                    href={phoneHref(tracking.restaurantSupportPhone)}
                    className="mt-2 inline-flex items-center gap-2 text-sm font-black text-[#F4B400]"
                  >
                    <Phone size={16} aria-hidden="true" />
                    {tracking.restaurantSupportPhone}
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-white/10 bg-white/6 p-5">
              <div className="flex items-start gap-3">
                <Search className="mt-0.5 shrink-0 text-[#E52B2B]" size={21} aria-hidden="true" />
                <div>
                  <h2 className="text-lg font-black">
                    Open live tracking to continue
                  </h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white/58">
                    Enter the phone or email used at checkout so we can show the
                    live status for this order.
                  </p>
                  {error ? (
                    <p className="mt-3 text-sm font-black text-red-200">{error}</p>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={trackingHref(orderNumber)}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#E52B2B] px-6 text-sm font-black text-white transition hover:bg-white hover:text-[#121212]"
            >
              Open full tracking
            </Link>
            <Link
              href="/menu"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/12 bg-white/8 px-6 text-sm font-black text-white transition hover:border-[#E52B2B]/55 hover:text-[#F4B400]"
            >
              Back to menu
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/12 bg-white/8 px-6 text-sm font-black text-white transition hover:border-[#E52B2B]/55 hover:text-[#F4B400]"
            >
              Contact Spice Fusion
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}




