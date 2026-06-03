import type { Metadata } from "next";
import { CartPageClient } from "@/components/CartPageClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  path: "/booking",
  title: "Order Indian Takeaway Online Addingham | Spice Fusion",
  description:
    "Order Indian takeaway online from Spice Fusion Addingham. Collection and delivery available with exclusive online discounts.",
});

export default function BookingPage() {
  return (
    <main className="bg-white text-[#121212]">
      <CartPageClient />
    </main>
  );
}
