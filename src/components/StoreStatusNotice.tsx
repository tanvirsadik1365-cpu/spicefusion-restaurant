"use client";

import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import type { PublicStoreStatus } from "@/lib/store-status-types";

function statusClass(status: PublicStoreStatus["status"]) {
  switch (status) {
    case "open":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "busy":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "paused":
      return "border-orange-200 bg-orange-50 text-orange-900";
    case "closed":
      return "border-zinc-200 bg-zinc-50 text-zinc-900";
  }
}

function StatusIcon({ status }: { status: PublicStoreStatus["status"] }) {
  if (status === "open") {
    return <CheckCircle2 size={18} aria-hidden="true" />;
  }

  if (status === "busy") {
    return <Clock size={18} aria-hidden="true" />;
  }

  return <AlertCircle size={18} aria-hidden="true" />;
}

export function StoreStatusNotice({
  className = "",
  storeStatus,
}: {
  className?: string;
  storeStatus: PublicStoreStatus | null;
}) {
  if (!storeStatus) {
    return null;
  }

  const classNameByStatus = storeStatus.acceptingPreorders
    ? "border-amber-200 bg-amber-50 text-amber-950"
    : statusClass(storeStatus.status);

  return (
    <div
      className={`rounded-lg border p-4 text-sm font-bold leading-6 ${classNameByStatus} ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">
          <StatusIcon status={storeStatus.status} />
        </span>
        <div>
          <p className="font-black">Store status: {storeStatus.label}</p>
          <p className="mt-1">{storeStatus.message}</p>
        </div>
      </div>
    </div>
  );
}
