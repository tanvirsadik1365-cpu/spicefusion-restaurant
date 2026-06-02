"use client";

import { useEffect } from "react";

const merchantReloadStorageKey = "spice-fusion-merchant-sw-reloaded-version-v1";
const merchantServiceWorkerVersion = "2026-05-07-v5";

function registerMerchantServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const hadController = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (
      !hadController ||
      sessionStorage.getItem(merchantReloadStorageKey) ===
        merchantServiceWorkerVersion
    ) {
      return;
    }

    sessionStorage.setItem(
      merchantReloadStorageKey,
      merchantServiceWorkerVersion,
    );
    window.location.reload();
  });

  navigator.serviceWorker
    .register(`/sw.js?v=${merchantServiceWorkerVersion}`, {
      scope: "/",
      updateViaCache: "none",
    })
    .then((registration) => {
      function updateWhenVisible() {
        if (document.visibilityState === "visible") {
          void registration.update();
        }
      }

      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;

        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            worker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });

      document.addEventListener("visibilitychange", updateWhenVisible);

      return registration.update();
    })
    .catch(() => {
      // The merchant page should still work if a browser blocks service workers.
    });
}

export function MerchantAppUpdater() {
  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.searchParams.has("token")) {
      url.searchParams.delete("token");
      window.history.replaceState(
        null,
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
    }

    registerMerchantServiceWorker();
  }, []);

  return null;
}


