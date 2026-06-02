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
  metaPixelId?: string;
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

function loadMetaPixel(metaPixelId?: string) {
  if (!metaPixelId || document.getElementById("meta-pixel-consent-script")) {
    return;
  }

  const script = document.createElement("script");
  script.id = "meta-pixel-consent-script";
  script.async = true;
  script.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');`;
  document.head.appendChild(script);
}

export function CookieConsentManager({ gtmId, metaPixelId }: Props) {
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
    loadMetaPixel(metaPixelId);
    trackEvent("cookie_consent_accepted");
  }, [consent, gtmId, metaPixelId]);

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
    <aside className="fixed inset-x-0 bottom-0 z-[100] border-t border-[#cbd5e1]/35 bg-[#121212]/96 p-3 text-[#F5F5F5] shadow-[0_-14px_34px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:inset-x-4 sm:bottom-4 sm:rounded-2xl sm:border">
      <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#E52B2B]/35 bg-[#E52B2B]/12 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#F4B400]">
            <ShieldCheck size={13} aria-hidden="true" />
            Privacy choices
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#F5F5F5]">
            We use cookies to improve performance and understand how customers use the site.
            Accepting helps us improve your ordering experience.
          </p>
          <p className="mt-1 text-xs leading-5 text-[#F5F5F5]/78">
            You can continue with essential cookies only. See our{" "}
            <Link href="/privacy-policy" className="font-black text-[#E52B2B] underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:min-w-[280px]">
          <button
            type="button"
            onClick={() => setChoice("accepted")}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#E52B2B] px-4 text-sm font-black text-[#121212] transition hover:bg-[#FFE7B2]"
          >
            Accept & Continue
          </button>
          <button
            type="button"
            onClick={() => setChoice("rejected")}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#cbd5e1] bg-transparent px-4 text-sm font-black text-[#F5F5F5] transition hover:border-[#E52B2B] hover:text-[#E52B2B]"
          >
            Reject Non-Essential
          </button>
        </div>
      </div>
    </aside>
  );
}


