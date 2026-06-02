import type { Metadata } from "next";
import { CartPageClient } from "@/components/CartPageClient";

export const metadata: Metadata = {
  title: "Cart & Payment",
  description:
    "Review your Spice Fusion TAKEAWAY order, choose collection or delivery, add your details and pay by card or cash.",
};

export default function CartPage() {
  return (
    <main className="bg-white text-[#121212]">
      <CartPageClient />
    </main>
  );
}




