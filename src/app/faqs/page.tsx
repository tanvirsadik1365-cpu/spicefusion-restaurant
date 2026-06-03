import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { FaqList } from "@/components/FaqList";
import { PageIntro } from "@/components/PageIntro";
import { faqs, foodImages } from "@/lib/restaurant";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
  jsonLdMarkup,
  shouldRenderJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  path: "/faqs",
  title: "Indian Takeaway FAQs Addingham | Spice Fusion Takeaway",
  description:
    "Find answers about Spice Fusion Takeaway ordering, delivery, collection discounts, Indian dishes and Bangladeshi cuisine in Addingham.",
});

const faqJsonLd = createFaqJsonLd();
const breadcrumbJsonLd = createBreadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "FAQs", path: "/faqs" },
]);

export default function FaqsPage() {
  return (
    <main className="bg-white text-[#121212]">
      {shouldRenderJsonLd ? (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={jsonLdMarkup(faqJsonLd)}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={jsonLdMarkup(breadcrumbJsonLd)}
          />
        </>
      ) : null}
      <PageIntro
        eyebrow="FAQs"
        title="Quick answers before you order."
        description="Ordering, delivery charges, collection, allergens, offers, and takeaway details."
        imageSrc={foodImages.hero}
        imageAlt="Spice Fusion TAKEAWAY curry and tandoori dishes"
        meta="Ordering, delivery, collection"
      />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <FaqList faqs={faqs} />

          <div className="spice-card mt-10 rounded-lg p-8 text-center">
            <HelpCircle className="mx-auto text-[#121212]" size={34} aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-black">Still have a question?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#5F5A53]">
              The takeaway can help with orders, delivery, allergens, and
              special requests.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#121212] px-6 text-sm font-black text-white transition hover:bg-[#1F0F06]"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}






