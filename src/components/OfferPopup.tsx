"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  Minimize2,
  ShoppingBag,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { offers } from "@/lib/restaurant";

const popupDelayMs = 900;
const slideDelayMs = 3600;
const autoMinimizeMs = 10_000;
export const OPEN_OFFER_POPUP_EVENT = "spice-fusion:open-offer-popup";
const seenSessionKey = "spice-fusion-offer-popup-seen-session-v2";

export function OfferPopup() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const isMerchantPage = pathname?.startsWith("/merchant");
  const isCheckoutFlow =
    pathname?.startsWith("/checkout") || pathname?.startsWith("/cart");
  const shouldSuppressPopup = isMerchantPage || isCheckoutFlow;
  const activeOffer = offers[activeIndex] ?? offers[0];

  function closePopup() {
    setIsVisible(false);
    setIsMinimized(false);
    try {
      window.sessionStorage.setItem(seenSessionKey, "1");
    } catch {
      // Ignore storage failures.
    }
  }

  function minimizePopup() {
    setIsMinimized(true);
  }

  function showPreviousOffer() {
    setActiveIndex((current) => (current - 1 + offers.length) % offers.length);
  }

  function showNextOffer() {
    setActiveIndex((current) => (current + 1) % offers.length);
  }

  useEffect(() => {
    if (shouldSuppressPopup) {
      setIsVisible(false);
      setIsMinimized(false);
      return;
    }

    let seenInSession = false;
    try {
      seenInSession = window.sessionStorage.getItem(seenSessionKey) === "1";
    } catch {
      // Ignore storage failures.
    }

    if (seenInSession) {
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(seenSessionKey, "1");
      } catch {
        // Ignore storage failures.
      }
      setIsVisible(true);
      setIsMinimized(false);
    }, popupDelayMs);

    return () => window.clearTimeout(timer);
  }, [pathname, shouldSuppressPopup]);

  useEffect(() => {
    if (shouldSuppressPopup) {
      return;
    }

    function openPopup() {
      setIsVisible(true);
      setIsMinimized(false);
      try {
        window.sessionStorage.setItem(seenSessionKey, "1");
      } catch {
        // Ignore storage failures.
      }
    }

    window.addEventListener(OPEN_OFFER_POPUP_EVENT, openPopup);

    return () => window.removeEventListener(OPEN_OFFER_POPUP_EVENT, openPopup);
  }, [shouldSuppressPopup]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closePopup();
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const intervalId = window.setInterval(showNextOffer, slideDelayMs);

    return () => window.clearInterval(intervalId);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || isMinimized) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsMinimized(true);
    }, autoMinimizeMs);

    return () => window.clearTimeout(timer);
  }, [isMinimized, isVisible]);

  if (!isVisible || shouldSuppressPopup) {
    return null;
  }

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-[88px] right-3 z-[80] inline-flex h-11 items-center gap-2 rounded-full border border-[#E52B2B] bg-[linear-gradient(145deg,#121212_0%,#121212_100%)] px-4 text-sm font-black text-[#F4B400] shadow-[0_18px_40px_rgba(0,0,0,0.4)] transition hover:border-[#E52B2B] hover:text-[#FFFFFF] sm:bottom-5 sm:right-5"
        aria-label="Reopen offer popup"
      >
        <Minimize2 size={16} aria-hidden="true" />
        Offers
      </button>
    );
  }

  return (
    <aside
      aria-labelledby="offer-popup-title"
      aria-describedby="offer-popup-description"
      className="fixed inset-x-3 bottom-[88px] z-[80] mx-auto max-w-[440px] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[420px]"
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#E52B2B] bg-[linear-gradient(145deg,#121212_0%,#121212_100%)] p-4 text-[#FFFFFF] shadow-[0_22px_56px_rgba(0,0,0,0.46)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#E52B2B,#F4B400,#E52B2B)]" />
        <button
          type="button"
          onClick={minimizePopup}
          aria-label="Minimize offer popup"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#E6CC98]/30 bg-[#FFFFFF14] text-[#FFFFFF] transition hover:bg-[#FFFFFF] hover:text-[#121212]"
        >
          <X size={16} aria-hidden="true" />
        </button>

        <div className="flex min-h-[86px] items-start gap-3 pr-8">
          <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E52B2B] text-white shadow-[0_12px_28px_rgba(229,43,43,0.24)]">
            <BadgePercent size={21} aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#F4B400]">
                  Offer {activeIndex + 1} of {offers.length}
                </p>
              <span className="rounded-full border border-[#E52B2B] bg-[#E52B2B]/20 px-2 py-0.5 text-[10px] font-black uppercase text-[#F4B400]">
                {activeOffer.note}
              </span>
            </div>

            <div className="mt-1 overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {offers.map((offer, index) => (
                  <div
                    key={offer.title}
                    className="w-full shrink-0 pr-1"
                    aria-hidden={activeIndex !== index}
                  >
                    <h2
                      id={index === activeIndex ? "offer-popup-title" : undefined}
                      className="text-xl font-black leading-tight text-[#FFFFFF]"
                    >
                      {offer.title}
                    </h2>
                    <p
                      id={
                        index === activeIndex
                          ? "offer-popup-description"
                          : undefined
                      }
                      className="mt-1 text-sm font-semibold leading-6 text-[#F8EED8]/82"
                    >
                      {offer.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5" aria-label="Offer slides">
            {offers.map((offer, index) => (
              <button
                key={offer.title}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show ${offer.title}`}
                aria-pressed={activeIndex === index}
                className={`h-2 rounded-full transition-all ${
                  activeIndex === index
                    ? "w-7 bg-[#E52B2B]"
                    : "w-2 bg-[#FFE7B2]/35 hover:bg-[#FFE7B2]/70"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={showPreviousOffer}
              aria-label="Show previous offer"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E6CC98]/30 bg-[#FFFFFF12] text-[#FFE7B2]/82 transition hover:border-[#E52B2B]/45 hover:text-[#F4B400]"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={showNextOffer}
              aria-label="Show next offer"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E6CC98]/30 bg-[#FFFFFF12] text-[#FFE7B2]/82 transition hover:border-[#E52B2B]/45 hover:text-[#F4B400]"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <Link
          href="/menu"
          onClick={closePopup}
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#E52B2B] px-4 text-sm font-black text-white shadow-lg shadow-black/15 transition hover:bg-white hover:text-[#121212]"
        >
          <ShoppingBag size={17} aria-hidden="true" />
          Order online
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}





