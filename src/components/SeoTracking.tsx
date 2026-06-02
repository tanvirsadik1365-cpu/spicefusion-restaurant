"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackEvent, trackMetaEvent, trackPageView } from "@/lib/analytics";

const menuScrollMilestones = [25, 50, 75, 100] as const;

export function SeoTracking() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    trackPageView(pathname);
    trackMetaEvent("PageView", { page_path: pathname });
  }, [pathname]);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");

      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href") ?? "";
      const text = anchor.textContent?.trim().toLowerCase() ?? "";

      if (href.startsWith("tel:")) {
        trackEvent("phone_click", { href, link_text: text });
      }

      if (href.includes("/contact")) {
        trackEvent("contact_click", { href, link_text: text });
      }

      if (href.includes("wa.me") || href.includes("whatsapp")) {
        trackEvent("whatsapp_click", { href, link_text: text });
      }
    }

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  useEffect(() => {
    if (pathname !== "/menu") {
      return;
    }

    const reached = new Set<number>();

    function onScroll() {
      const doc = document.documentElement;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;

      if (scrollHeight <= 0) {
        return;
      }

      const scrolled = (window.scrollY / scrollHeight) * 100;

      for (const milestone of menuScrollMilestones) {
        if (scrolled >= milestone && !reached.has(milestone)) {
          reached.add(milestone);
          trackEvent("menu_scroll_depth", {
            page_path: pathname,
            scroll_percent: milestone,
          });
        }
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return null;
}



