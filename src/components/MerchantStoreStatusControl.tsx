"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  PauseCircle,
  Power,
  RefreshCw,
  Save,
  TimerReset,
} from "lucide-react";

type StoreOrderingStatus = "busy" | "closed" | "open" | "paused";

type MerchantStoreStatus = {
  label: string;
  message: string;
  orderingAllowed: boolean;
  prepTimeMinutes: number;
  status: StoreOrderingStatus;
  supportPhone: string;
  updatedAt: string | null;
};

type StoreStatusResponse = {
  error?: string;
  storeStatus?: MerchantStoreStatus;
};

const statusOptions = [
  {
    icon: CheckCircle2,
    label: "Open",
    status: "open",
  },
  {
    icon: Clock3,
    label: "Busy",
    status: "busy",
  },
  {
    icon: PauseCircle,
    label: "Paused",
    status: "paused",
  },
  {
    icon: Power,
    label: "Closed",
    status: "closed",
  },
] satisfies Array<{
  icon: typeof CheckCircle2;
  label: string;
  status: StoreOrderingStatus;
}>;

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not saved yet";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not saved yet";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function clampPrepTime(value: number) {
  return Math.min(Math.max(value, 5), 120);
}

export function MerchantStoreStatusControl() {
  const [storeStatus, setStoreStatus] = useState<MerchantStoreStatus | null>(
    null,
  );
  const [selectedStatus, setSelectedStatus] =
    useState<StoreOrderingStatus>("open");
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(20);
  const [supportPhone, setSupportPhone] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [savedNotice, setSavedNotice] = useState("");
  const statusUrl = useMemo(() => "/api/merchant/store-status", []);

  const applyLoadedStatus = useCallback((nextStatus: MerchantStoreStatus) => {
    setStoreStatus(nextStatus);
    setSelectedStatus(nextStatus.status);
    setPrepTimeMinutes(nextStatus.prepTimeMinutes);
    setSupportPhone(nextStatus.supportPhone);
  }, []);

  const refreshStoreStatus = useCallback(
    async (signal?: AbortSignal) => {
      setRefreshing(true);

      try {
        const response = await fetch(statusUrl, {
          cache: "no-store",
          signal,
        });
        const result = (await response.json().catch(() => ({}))) as
          StoreStatusResponse;

        if (!response.ok || !result.storeStatus) {
          throw new Error(result.error ?? "Store status could not be loaded.");
        }

        applyLoadedStatus(result.storeStatus);
        setLoadError("");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Store status could not be loaded.",
        );
      } finally {
        if (!signal?.aborted) {
          setRefreshing(false);
        }
      }
    },
    [applyLoadedStatus, statusUrl],
  );

  const saveStoreStatus = useCallback(async () => {
    setSaving(true);
    setLoadError("");
    setSavedNotice("");

    try {
      const response = await fetch(statusUrl, {
        body: JSON.stringify({
          prepTimeMinutes: clampPrepTime(prepTimeMinutes),
          status: selectedStatus,
          supportPhone,
        }),
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const result = (await response.json().catch(() => ({}))) as
        StoreStatusResponse;

      if (!response.ok || !result.storeStatus) {
        throw new Error(result.error ?? "Store status could not be updated.");
      }

      applyLoadedStatus(result.storeStatus);
      setSavedNotice("Saved");
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Store status could not be updated.",
      );
    } finally {
      setSaving(false);
    }
  }, [
    applyLoadedStatus,
    prepTimeMinutes,
    selectedStatus,
    statusUrl,
    supportPhone,
  ]);

  useEffect(() => {
    const controller = new AbortController();

    void refreshStoreStatus(controller.signal);
    const timer = window.setInterval(() => {
      void refreshStoreStatus(controller.signal);
    }, 30000);

    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [refreshStoreStatus]);

  return (
    <section className="spice-card rounded-lg p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#121212]">
            Live ordering
          </p>
          <h2 className="mt-2 text-2xl font-black">
            {storeStatus ? storeStatus.label : "Store status"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#5F5A53]">
            {storeStatus?.message ?? "Loading current status..."}
          </p>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#121212]">
            Updated {formatDateTime(storeStatus?.updatedAt ?? null)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refreshStoreStatus()}
          disabled={refreshing || saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#121212]/20 bg-white px-4 text-sm font-black text-[#121212] transition hover:border-[#121212] hover:bg-[#FFF7EC] disabled:opacity-60"
        >
          <RefreshCw
            className={refreshing ? "animate-spin" : ""}
            size={16}
            aria-hidden="true"
          />
          Refresh
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end">
        <div>
          <span className="text-sm font-black text-[#121212]">Status</span>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const active = selectedStatus === option.status;

              return (
                <button
                  key={option.status}
                  type="button"
                  onClick={() => setSelectedStatus(option.status)}
                  aria-pressed={active}
                  disabled={saving}
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-3 text-sm font-black transition disabled:opacity-60 ${
                    active
                      ? "border-[#121212] bg-[#121212] text-white"
                      : "border-black/10 bg-white text-[#5F5A53] hover:border-[#121212]/40 hover:text-[#121212]"
                  }`}
                >
                  <Icon size={16} aria-hidden="true" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="text-sm font-black text-[#121212]">
          Prep time
          <span className="mt-2 grid h-12 grid-cols-[36px_1fr_42px] items-center rounded-lg border border-black/10 bg-white px-2 focus-within:border-[#121212] focus-within:ring-4 focus-within:ring-[#121212]/10">
            <TimerReset className="text-[#121212]" size={17} aria-hidden="true" />
            <input
              value={prepTimeMinutes}
              min={5}
              max={120}
              onChange={(event) =>
                setPrepTimeMinutes(
                  clampPrepTime(Number.parseInt(event.target.value, 10) || 5),
                )
              }
              className="h-10 border-0 bg-transparent px-2 text-sm font-black outline-none"
              type="number"
            />
            <span className="text-xs font-black uppercase text-[#5F5A53]">
              min
            </span>
          </span>
        </label>

        <label className="text-sm font-black text-[#121212]">
          Support phone
          <input
            value={supportPhone}
            onChange={(event) => setSupportPhone(event.target.value)}
            className="mt-2 h-12 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-black outline-none transition focus:border-[#121212] focus:ring-4 focus:ring-[#121212]/10"
            type="tel"
          />
        </label>

        <button
          type="button"
          onClick={() => void saveStoreStatus()}
          disabled={saving}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#121212] px-5 text-sm font-black text-white transition hover:bg-[#1F0F06] disabled:opacity-60"
        >
          <Save
            className={saving ? "animate-spin" : ""}
            size={16}
            aria-hidden="true"
          />
          {saving ? "Saving" : "Save"}
        </button>
      </div>

      {savedNotice ? (
        <p className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-black text-emerald-900">
          <CheckCircle2 size={17} aria-hidden="true" />
          {savedNotice}
        </p>
      ) : null}

      {loadError ? (
        <p className="mt-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-black leading-6 text-red-900">
          <AlertCircle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
          {loadError}
        </p>
      ) : null}
    </section>
  );
}



