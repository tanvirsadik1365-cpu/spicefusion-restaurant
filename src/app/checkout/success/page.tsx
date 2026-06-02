import type { Metadata } from "next";
import { CheckoutSuccessTrackingClient } from "@/components/CheckoutSuccessTrackingClient";

export const metadata: Metadata = {
  title: "Order Received",
  description:
    "Order confirmation for Spice Fusion TAKEAWAY online and cash orders.",
};

export default function CheckoutSuccessPage() {
  return <CheckoutSuccessTrackingClient />;
}


