import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgePercent, MapPin, Phone, ShoppingBag } from "lucide-react";
import { dishSeoPages, getDishSeoPage } from "@/lib/menu-seo";
import { restaurant } from "@/lib/restaurant";
import {
  createBreadcrumbJsonLd,
  createDishFaqJsonLd,
  createDishJsonLd,
  createDishMetadata,
  jsonLdMarkup,
} from "@/lib/seo";

type DishPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return dishSeoPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: DishPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getDishSeoPage(slug);

  if (!page) {
    return {};
  }

  return createDishMetadata(page);
}

export default async function DishSeoPage({ params }: DishPageProps) {
  const { slug } = await params;
  const page = getDishSeoPage(slug);

  if (!page) {
    notFound();
  }

  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Menu", path: "/menu" },
    { name: page.name, path: `/menu/${page.slug}` },
  ]);
  const dishJsonLd = createDishJsonLd(page);
  const faqJsonLd = createDishFaqJsonLd(page);

  return (
    <main className="bg-[#F5F5F5] text-[#121212]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdMarkup(breadcrumbJsonLd)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdMarkup(dishJsonLd)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdMarkup(faqJsonLd)}
      />

      <section className="relative isolate overflow-hidden px-4 pb-14 pt-48 text-white sm:px-6 lg:px-8 lg:py-20">
        <Image
          src={page.image}
          alt={page.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-44"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,18,18,0.94)_0%,rgba(18,18,18,0.76)_48%,rgba(18,18,18,0.36)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,0.1)_0%,rgba(18,18,18,0.68)_76%,#F5F5F5_100%)]" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#F4B400] backdrop-blur">
              Indian takeaway Addingham
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
              {page.h1}
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#FFF1D1]">
              {page.intro}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#E52B2B] px-6 text-sm font-black text-white shadow-[0_16px_38px_rgba(229,43,43,0.24)] transition hover:-translate-y-0.5 hover:bg-white hover:text-[#121212]"
              >
                <ShoppingBag size={17} aria-hidden="true" />
                Order Direct & Save
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a
                href={restaurant.phoneHref}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/16 bg-white/10 px-6 text-sm font-black text-white transition hover:border-[#F4B400] hover:text-[#F4B400]"
              >
                <Phone size={17} aria-hidden="true" />
                Call {restaurant.phone}
              </a>
            </div>
          </div>

          <aside className="rounded-2xl border border-white/14 bg-white p-5 text-[#121212] shadow-[0_24px_70px_rgba(0,0,0,0.2)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E52B2B]">
              Direct offers
            </p>
            <div className="mt-4 grid gap-3">
              <p className="flex items-center gap-2 rounded-lg bg-[#E52B2B]/10 p-3 text-sm font-black">
                <BadgePercent size={18} className="text-[#E52B2B]" />
                15% off collection orders
              </p>
              <p className="flex items-center gap-2 rounded-lg bg-[#F4B400]/18 p-3 text-sm font-black">
                <BadgePercent size={18} className="text-[#A46900]" />
                10% off delivery orders
              </p>
              <p className="flex items-center gap-2 rounded-lg bg-[#F5F5F5] p-3 text-sm font-bold">
                <MapPin size={18} className="text-[#E52B2B]" />
                Delivery within 5 miles, maximum 7 miles.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.45fr)]">
          <div className="rounded-2xl border border-[#cbd5e1] bg-white p-6 shadow-[0_18px_52px_rgba(18,18,18,0.1)] sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E52B2B]">
              Local favourite
            </p>
            <h2 className="mt-3 text-3xl font-black">
              Order {page.name} from Spice Fusion Takeaway
            </h2>
            <p className="mt-4 text-base font-semibold leading-8 text-[#2F251C]">
              Spice Fusion serves Indian takeaway and Bangladeshi cuisine from
              137 Main St, Addingham, close to Ilkley, Skipton and Keighley.
              Order online for direct collection or local delivery in LS29.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {page.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-lg border border-[#cbd5e1] bg-[#F5F5F5] p-4 text-sm font-black"
                >
                  {highlight}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#cbd5e1] bg-white p-6 shadow-[0_18px_52px_rgba(18,18,18,0.1)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E52B2B]">
              Nearby areas
            </p>
            <ul className="mt-4 grid gap-2 text-sm font-bold leading-6 text-[#2F251C]">
              <li>Addingham</li>
              <li>Ilkley</li>
              <li>LS29</li>
              <li>West Yorkshire</li>
              <li>Skipton and Keighley nearby</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-2xl border border-[#cbd5e1] bg-white p-6 shadow-[0_18px_52px_rgba(18,18,18,0.1)] sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E52B2B]">
            Questions
          </p>
          <h2 className="mt-3 text-3xl font-black">FAQs about {page.name}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {page.faqs.map((faq) => (
              <article
                key={faq.question}
                className="rounded-lg border border-[#cbd5e1] bg-[#F5F5F5] p-5"
              >
                <h3 className="font-black">{faq.question}</h3>
                <p className="mt-3 text-sm font-semibold leading-7 text-[#2F251C]">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
