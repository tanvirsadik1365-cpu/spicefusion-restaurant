"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_KEY,
  type CookieConsent,
  readCookieConsent,
} from "@/lib/consent";
import { trackEvent } from "@/lib/analytics";

type Props = {
  gtmId: string;
};

function loadGtm(gtmId: string) {
  if (
    !gtmId ||
    document.getElementById("gtm-consent-script") ||
    document.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${gtmId}"]`)
  ) {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });

  const script = document.createElement("script");
  script.id = "gtm-consent-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.appendChild(script);
}

export function CookieConsentManager({ gtmId }: Props) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [ready, setReady] = useState(false);

  const shouldShowBanner = ready && consent === null;

  useEffect(() => {
    setConsent(readCookieConsent());
    setReady(true);
  }, []);

  useEffect(() => {
    if (consent !== "accepted") {
      return;
    }

    loadGtm(gtmId);
    trackEvent("cookie_consent_accepted");
    trackEvent("page_view", {
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title,
    });
  }, [consent, gtmId]);

  function setChoice(value: CookieConsent) {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
    setConsent(value);

    if (value === "rejected") {
      trackEvent("cookie_consent_rejected");
    }
  }

  if (!shouldShowBanner) {
    return null;
  }

  return (
    <aside className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-[620px] rounded-xl border border-white/12 bg-[#121212]/96 p-3 text-white shadow-[0_22px_70px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:bottom-5 sm:p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-black text-white">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E52B2B] text-white">
              <ShieldCheck size={16} aria-hidden="true" />
            </span>
            Cookie preferences
          </p>
          <p className="mt-2 text-xs font-medium leading-5 text-white/74 sm:text-sm">
            We use essential cookies for ordering. With your permission, analytics
            cookies help us improve the website.
          </p>
          <Link
            href="/privacy-policy"
            className="mt-1 inline-flex text-xs font-black text-[#F4B400] underline-offset-4 hover:underline"
          >
            Read privacy policy
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:w-[230px] sm:grid-cols-1">
          <button
            type="button"
            onClick={() => setChoice("accepted")}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#E52B2B] px-3 text-xs font-black text-white shadow-[0_12px_28px_rgba(229,43,43,0.24)] transition hover:bg-[#c91f1f] sm:text-sm"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => setChoice("rejected")}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/16 bg-white/8 px-3 text-xs font-black text-white transition hover:border-[#F4B400] hover:text-[#F4B400] sm:text-sm"
          >
            Essential only
          </button>
        </div>
      </div>
    </aside>
  );
}


