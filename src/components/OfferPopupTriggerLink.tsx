"use client";

import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";
import { OPEN_OFFER_POPUP_EVENT } from "@/components/OfferPopup";

type OfferPopupTriggerLinkProps = LinkProps & {
  children: ReactNode;
  className?: string;
};

export function OfferPopupTriggerLink({
  children,
  className,
  ...props
}: OfferPopupTriggerLinkProps) {
  return (
    <Link
      {...props}
      className={className}
      onClick={(event) => {
        props.onClick?.(event);
        window.dispatchEvent(new Event(OPEN_OFFER_POPUP_EVENT));
      }}
    >
      {children}
    </Link>
  );
}


