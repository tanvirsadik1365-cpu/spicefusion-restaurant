import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Store,
} from "lucide-react";
import { foodImages, restaurant } from "@/lib/restaurant";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  jsonLdMarkup,
  seoPages,
  shouldRenderJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(seoPages.contact);

const breadcrumbJsonLd = createBreadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
]);

const fieldClass =
  "mt-2 h-12 w-full rounded-lg border border-[#cbd5e1] bg-[#F5F5F5] px-4 text-sm font-semibold text-[#121212] outline-none transition placeholder:text-[#8B7B66] focus:border-[#E52B2B]/70 focus:ring-4 focus:ring-[#E52B2B]/12";

const contactCards = [
  {
    Icon: MapPin,
    title: "Main St Addingham",
    body: "137 Main St, Addingham, Ilkley LS29 0LZ",
    cta: "Open maps",
    href: restaurant.mapsUrl,
  },
  {
    Icon: Phone,
    title: "Call direct",
    body: restaurant.phone,
    cta: "Call restaurant",
    href: restaurant.phoneHref,
  },
  {
    Icon: Mail,
    title: "Email",
    body: restaurant.email,
    cta: "Send email",
    href: `mailto:${restaurant.email}`,
  },
  {
    Icon: Store,
    title: "Takeaway service",
    body: "Collection, local delivery, and takeaway orders from Main St.",
    cta: "View menu",
    href: "/menu",
  },
];

export default function ContactPage() {
  return (
    <main className="bg-[#F5F5F5] text-[#121212]">
      {shouldRenderJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdMarkup(breadcrumbJsonLd)}
        />
      ) : null}
      <section className="relative isolate overflow-hidden px-4 pb-12 pt-52 sm:px-6 lg:px-8 lg:py-16">
        <Image
          src={foodImages.exterior}
          alt="Spice Fusion TAKEAWAY Restaurant cuisine in Addingham"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-5"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,242,236,0.96)_0%,rgba(245,242,236,0.9)_48%,rgba(245,242,236,0.84)_100%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(245,242,236,0.12)_0%,rgba(245,242,236,0.72)_78%,#F5F5F5_100%)]"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.95fr)_390px] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#E8C06B] bg-[#FFF1CC] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#7A4F00] shadow-[0_14px_34px_rgba(0,0,0,0.12)]">
              <MessageCircle size={15} aria-hidden="true" />
              Contact Spice Fusion TAKEAWAY
            </p>
            <h1 className="mt-5 max-w-4xl text-[2.25rem] font-black leading-[1.05] sm:text-6xl lg:text-7xl">
              Contact Spice Fusion Takeaway
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#241B13]">
              Speak to the takeaway for orders, delivery
              questions, and Main St directions.
            </p>
          </div>

          <aside className="rounded-2xl border border-[#cbd5e1] bg-[#ffffff] p-6 shadow-[0_24px_70px_rgba(18,18,18,0.12)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#A46900]">
              Direct line
            </p>
            <a
              href={restaurant.phoneHref}
              className="mt-4 inline-flex text-3xl font-black leading-tight text-[#121212] transition hover:text-[#E52B2B]"
            >
              {restaurant.phone}
            </a>
            <p className="mt-4 text-sm font-semibold leading-7 text-[#2F251C]">
              For active orders, allergy questions, delivery timing, and order
              changes, calling is fastest.
            </p>
          </aside>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contactCards.map(({ Icon, title, body, cta, href }) => (
              <article
                key={title}
                className="flex min-h-[220px] flex-col rounded-2xl border border-[#cbd5e1] bg-[#ffffff] p-5 shadow-[0_18px_52px_rgba(18,18,18,0.1)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E52B2B] text-[#121212]">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-xl font-black">{title}</h2>
                <p className="mt-3 text-sm font-semibold leading-7 text-[#241B13]">
                  {body}
                </p>
                <a
                  href={href}
                  className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-black text-[#E52B2B] transition hover:text-[#121212]"
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                >
                  {cta}
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
            <form
              action={`mailto:${restaurant.email}?subject=${encodeURIComponent(
                "Website enquiry",
              )}`}
              method="post"
              encType="text/plain"
              className="rounded-2xl border border-[#cbd5e1] bg-[#ffffff] p-6 shadow-[0_24px_70px_rgba(18,18,18,0.1)] sm:p-8"
            >
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E52B2B]">
                Message
              </p>
              <h2 className="mt-2 text-3xl font-black">Send a note.</h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-[#2F251C]">
                Use this for order questions, feedback, allergy notes, or
                special requests.
              </p>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-black">
                  Name
                  <input
                    className={fieldClass}
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                  />
                </label>
                <label className="text-sm font-black">
                  Phone
                  <input
                    className={fieldClass}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                  />
                </label>
                <label className="text-sm font-black">
                  Email
                  <input
                    className={fieldClass}
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="text-sm font-black">
                  Subject
                  <select className={fieldClass} name="subject" defaultValue="" required>
                    <option value="" disabled>
                      Select a subject
                    </option>
                    <option>General enquiry</option>
                    <option>Order question</option>
                    <option>Feedback</option>
                    <option>Catering request</option>
                  </select>
                </label>
              </div>

              <label className="mt-5 block text-sm font-black">
                Message
                <textarea
                  className="mt-2 min-h-40 w-full rounded-lg border border-[#cbd5e1] bg-[#F5F5F5] px-4 py-3 text-sm font-semibold text-[#121212] outline-none transition placeholder:text-[#8B7B66] focus:border-[#E52B2B]/70 focus:ring-4 focus:ring-[#E52B2B]/12"
                  name="message"
                  required
                />
              </label>

              <button
                type="submit"
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#E52B2B] px-4 py-3 text-center text-sm font-black text-[#121212] transition hover:bg-white"
              >
                <Send size={18} aria-hidden="true" />
                Send message
              </button>
            </form>

            <div className="overflow-hidden rounded-2xl border border-[#cbd5e1] bg-[#ffffff] shadow-[0_24px_70px_rgba(18,18,18,0.12)]">
              <div className="p-6 sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E52B2B]">
                  Map
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  137 Main St, Addingham
                </h2>
                <p className="mt-3 text-sm font-semibold leading-7 text-[#2F251C]">
                  Spice Fusion TAKEAWAY is on Main St in Addingham, Ilkley LS29 0LZ.
                </p>
                <a
                  href={restaurant.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#E52B2B] px-5 text-sm font-black text-[#121212] transition hover:bg-white"
                >
                  <ExternalLink size={16} aria-hidden="true" />
                  Open Google Maps
                </a>
              </div>
              <iframe
                title="Spice Fusion TAKEAWAY location on Google Maps"
                src={restaurant.mapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[360px] w-full border-0"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}








