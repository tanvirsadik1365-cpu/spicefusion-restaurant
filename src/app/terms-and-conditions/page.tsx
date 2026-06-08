import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CreditCard, Mail, ShoppingBag, Truck } from "lucide-react";
import { PageIntro } from "@/components/PageIntro";
import { foodImages, restaurant } from "@/lib/restaurant";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions for ordering, delivery, collection, offers, and website use at Spice Fusion TAKEAWAY in Addingham.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
};

const terms = [
  {
    Icon: ShoppingBag,
    title: "Orders",
    detail:
      "Orders placed through this website are sent to Spice Fusion TAKEAWAY for acceptance. An order is not confirmed until it has been accepted by the restaurant or payment/order confirmation has been issued.",
  },
  {
    Icon: Truck,
    title: "Collection & Delivery",
    detail:
      "Collection is from 137 Main St, Addingham, Ilkley LS29 0LZ. Delivery is £3 within a 5-mile radius with a £20 minimum order. Orders outside 5 miles may be charged £1 per extra mile up to 7 miles maximum.",
  },
  {
    Icon: CreditCard,
    title: "Payment",
    detail:
      "Online card payments are processed securely by Stripe. Cash orders may be paid on collection or delivery where available. Prices are shown in GBP and may change without notice.",
  },
  {
    Icon: AlertTriangle,
    title: "Allergies",
    detail:
      "If you or anyone you are ordering for has a food allergy or intolerance, contact the restaurant before ordering. Do not rely only on website notes for allergy requests.",
  },
];

const sections = [
  {
    title: "Offers & Rewards",
    body:
      "Current delivery and collection rules are applied according to the active rules shown on the website. Offers cannot always be combined and may be changed, paused, or withdrawn by the restaurant.",
  },
  {
    title: "Cancellations & Refunds",
    body:
      "Call the restaurant as soon as possible if you need to change or cancel an order. Once food preparation has started, cancellation or refund availability may be limited. Card payment refunds, where approved, are returned through the original payment method.",
  },
  {
    title: "Order History",
    body:
      "Orders are subject to acceptance, delivery availability, menu availability, and opening hours. For large orders or special requests, contact the takeaway directly.",
  },
  {
    title: "Website Use",
    body:
      "Use this website only for lawful personal ordering, account, and enquiry purposes. Do not attempt to interfere with the website, payment flow, merchant dashboard, or customer account systems.",
  },
  {
    title: "Account History",
    body:
      "Signed-in customers may see eligible order history linked to their account email. Guest orders remain valid but may not appear in account history unless linked later.",
  },
  {
    title: "Changes",
    body:
      "These terms may be updated as the website, menu, offers, delivery rules, or restaurant operations change. The latest version on this page applies when you use the website.",
  },
];

export default function TermsAndConditionsPage() {
  return (
    <main className="bg-white text-[#121212]">
      <PageIntro
        eyebrow="Legal"
        title="Terms & Conditions"
        description={`Terms for using ${restaurant.website}, placing takeaway orders, and contacting Spice Fusion TAKEAWAY.`}
        imageSrc={foodImages.exterior}
        imageAlt="Spice Fusion TAKEAWAY takeaway branding"
        meta="Last updated May 8, 2026"
      />

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 md:grid-cols-2">
            {terms.map(({ Icon, title, detail }) => (
              <article key={title} className="spice-card rounded-lg p-5">
                <Icon className="text-[#121212]" size={24} aria-hidden="true" />
                <h2 className="mt-4 text-xl font-black">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#5F5A53]">
                  {detail}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 spice-card rounded-lg p-6 sm:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              {sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-lg font-black">{section.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[#5F5A53]">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-[#cbd5e1] bg-[#F5F5F5] p-6">
            <h2 className="text-xl font-black">Questions about these terms?</h2>
            <p className="mt-2 text-sm leading-7 text-[#5F5A53]">
              Contact Spice Fusion TAKEAWAY before ordering if anything is unclear,
              especially for allergies, order changes, refunds, or large
              orders.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={restaurant.phoneHref}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#121212] px-5 text-sm font-black text-white transition hover:bg-[#1F0F06]"
              >
                {restaurant.phone}
              </a>
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#121212]/20 bg-white px-5 text-sm font-black text-[#121212] transition hover:border-[#121212]"
              >
                <Mail size={16} aria-hidden="true" />
                Contact page
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}





