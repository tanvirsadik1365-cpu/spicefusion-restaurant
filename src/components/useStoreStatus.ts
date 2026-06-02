"use client";

import { useEffect, useState } from "react";
import type { PublicStoreStatus } from "@/lib/store-status-types";

type StoreStatusResponse = {
  storeStatus?: PublicStoreStatus;
};
const storeStatusCacheKey = "spice-fusion-store-status-cache-v1";

export function useStoreStatus() {
  const [storeStatus, setStoreStatus] = useState<PublicStoreStatus | null>(null);

  useEffect(() => {
    let active = true;

    try {
      const cached = window.sessionStorage.getItem(storeStatusCacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as PublicStoreStatus;
        if (parsed && typeof parsed === "object") {
          setStoreStatus(parsed);
        }
      }
    } catch {
      // Ignore cache read errors.
    }

    async function loadStoreStatus() {
      try {
        const response = await fetch("/api/store-status");
        const payload = (await response.json().catch(() => ({}))) as StoreStatusResponse;

        if (active && response.ok && payload.storeStatus) {
          setStoreStatus(payload.storeStatus);
          try {
            window.sessionStorage.setItem(
              storeStatusCacheKey,
              JSON.stringify(payload.storeStatus),
            );
          } catch {
            // Ignore cache write errors.
          }
        }
      } catch {}
    }

    void loadStoreStatus();

    const interval = window.setInterval(loadStoreStatus, 90000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return {
    orderingAllowed: storeStatus?.orderingAllowed ?? true,
    storeStatus,
  };
}


