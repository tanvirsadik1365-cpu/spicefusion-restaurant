"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Phone, ShoppingBag } from "lucide-react";
import { restaurant } from "@/lib/restaurant";

type MotionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

function animationDelayStyle(delay: number) {
  return delay ? { animationDelay: `${delay}s` } : undefined;
}

export function MotionReveal({
  children,
  className = "",
  delay = 0,
}: MotionProps) {
  return (
    <div className={`section-reveal ${className}`} style={animationDelayStyle(delay)}>
      {children}
    </div>
  );
}

export function MotionStagger({ children, className = "" }: MotionProps) {
  return <div className={className}>{children}</div>;
}

export function MotionItem({ children, className = "" }: MotionProps) {
  return <div className={`home-reveal ${className}`}>{children}</div>;
}

type MagneticLinkProps = {
  href: string;
  children: ReactNode;
  className: string;
  ariaLabel?: string;
};

export function MagneticLink({
  href,
  children,
  className,
  ariaLabel,
}: MagneticLinkProps) {
  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

export function MobileStickyCta() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 420);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <nav
      aria-label="Quick ordering actions"
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-white/12 bg-[#121212]/92 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-16px_40px_rgba(0,0,0,0.42)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-[1fr_auto] gap-2">
        <Link
          href="/menu"
          className="inline-flex h-[52px] min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#E52B2B] px-5 text-sm font-black text-white shadow-[0_12px_30px_rgba(229,43,43,0.26)]"
        >
          <ShoppingBag size={18} aria-hidden="true" />
          Order online
        </Link>
        <a
          href={restaurant.phoneHref}
          aria-label={`Call ${restaurant.shortName}`}
          className="inline-flex h-[52px] min-h-[52px] w-14 items-center justify-center rounded-full border border-white/16 bg-white/10 text-white"
        >
          <Phone size={18} aria-hidden="true" />
        </a>
      </div>
    </nav>
  );
}



