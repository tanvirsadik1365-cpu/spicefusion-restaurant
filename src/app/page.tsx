import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChefHat,
  CircleCheck,
  Clock,
  ExternalLink,
  Flame,
  Heart,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Timer,
  Truck,
  Utensils,
} from "lucide-react";
import {
  featuredDishes,
  foodImages,
  logoImage,
  menuCategories,
  offers,
  restaurant,
} from "@/lib/restaurant";
import { createPageMetadata, seoPages } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(seoPages.home);

const heroStats = [
  ["£3", "Delivery within 5 miles"],
  ["£15", "Minimum delivery order"],
  ["7 mi", "Maximum delivery area"],
];

const orderSteps = [
  {
    Icon: Utensils,
    title: "Pick your favourites",
    text: "Browse appetisers, tandoori grills, chef specials, biryani, breads and set meals.",
  },
  {
    Icon: Timer,
    title: "Choose collection or delivery",
    text: "Collection from Main St or local delivery across Addingham and nearby LS29 addresses.",
  },
  {
    Icon: Phone,
    title: "Tell us allergy notes",
    text: "Some dishes may contain nuts or traces of nuts, so let the team know before ordering.",
  },
];

const storyPoints = [
  "Freshly cooked Indian takeaway from the heart of Addingham.",
  "Signature curries, tandoori grills and familiar takeaway favourites.",
  "Clear delivery terms before checkout: £3 within 5 miles, then £1 per extra mile up to 7 miles.",
];

const homeCss = `
.spice-home {
  --spice-red: #E52B2B;
  --spice-yellow: #F4B400;
  --spice-white: #FFFFFF;
  --spice-grey: #F5F5F5;
  --spice-charcoal: #121212;
}

.spice-reveal {
  animation: spice-reveal 760ms cubic-bezier(.2,.8,.2,1) both;
}

.spice-reveal-delay {
  animation-delay: 140ms;
}

.spice-float {
  animation: spice-float 7s ease-in-out infinite;
}

.spice-glow {
  background:
    radial-gradient(circle at 18% 22%, rgba(244, 180, 0, .22), transparent 28%),
    radial-gradient(circle at 80% 14%, rgba(229, 43, 43, .35), transparent 30%),
    radial-gradient(circle at 80% 84%, rgba(244, 180, 0, .16), transparent 26%),
    #121212;
}

@keyframes spice-reveal {
  from {
    opacity: 0;
    transform: translateY(22px) scale(.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes spice-float {
  0%, 100% {
    transform: translateY(0) rotate(-1deg);
  }
  50% {
    transform: translateY(-12px) rotate(1deg);
  }
}
`;

export default function Home() {
  return (
    <main className="spice-home overflow-hidden bg-[#121212] text-white">
      <style dangerouslySetInnerHTML={{ __html: homeCss }} />

      <section className="spice-glow relative isolate overflow-hidden px-4 pb-10 pt-8 sm:px-6 lg:min-h-[92svh] lg:px-8 lg:pb-12 lg:pt-10">
        <Image
          src={foodImages.hero}
          alt="Spice Fusion takeaway dishes"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-36 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(18,18,18,.98)_0%,rgba(18,18,18,.86)_46%,rgba(18,18,18,.52)_100%)]" />
        <div className="absolute left-[-8rem] top-28 h-64 w-64 rounded-full bg-[#E52B2B]/30 blur-3xl" />
        <div className="absolute bottom-0 right-[-10rem] h-80 w-80 rounded-full bg-[#F4B400]/25 blur-3xl" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 lg:min-h-[calc(92svh-6rem)] lg:grid-cols-[1.02fr_.78fr] lg:items-center lg:gap-10">
          <div className="spice-reveal">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#F4B400] shadow-[0_16px_48px_rgba(0,0,0,.28)] backdrop-blur">
              <Sparkles size={15} aria-hidden="true" />
              Addingham Indian Takeaway
            </div>

            <h1 className="mt-5 max-w-5xl text-[2.75rem] font-semibold leading-[0.95] tracking-[-0.035em] text-white sm:mt-6 sm:text-7xl lg:text-[6.4rem]">
              Fresh spice, fast comfort, proper takeaway nights.
            </h1>
            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-white/78 sm:text-lg">
              Spice Fusion TAKEAWAY serves freshly cooked curries, tandoori
              grills, biryani, naan and set meals from 137 Main St, Addingham.
              Order online for collection or local delivery.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu"
                className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#E52B2B] px-7 text-sm font-black text-white shadow-[0_20px_55px_rgba(229,43,43,.34)] transition hover:-translate-y-1 hover:bg-[#F4B400] hover:text-[#121212]"
              >
                <ShoppingBag size={19} aria-hidden="true" />
                Start an order
                <ArrowRight className="transition group-hover:translate-x-1" size={17} aria-hidden="true" />
              </Link>
              <a
                href={restaurant.phoneHref}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 text-sm font-black text-white backdrop-blur transition hover:-translate-y-1 hover:border-[#F4B400] hover:text-[#F4B400]"
              >
                <Phone size={18} aria-hidden="true" />
                Call {restaurant.phone}
              </a>
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-2 sm:mt-9 sm:gap-3">
              {heroStats.map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/14 bg-white/10 p-3 backdrop-blur sm:p-4">
                  <p className="text-2xl font-semibold text-[#F4B400] sm:text-3xl">{value}</p>
                  <p className="mt-1 text-[0.66rem] font-bold uppercase leading-4 tracking-wide text-white/68 sm:text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="spice-reveal spice-reveal-delay relative lg:block">
            <div className="spice-float relative overflow-hidden rounded-[2.2rem] border border-white/14 bg-white/10 p-4 shadow-[0_30px_90px_rgba(0,0,0,.38)] backdrop-blur">
              <div className="relative aspect-[16/11] overflow-hidden rounded-[1.7rem] lg:aspect-[4/5]">
                <Image
                  src={foodImages.tandoori}
                  alt="Freshly cooked Spice Fusion tandoori mixed grill"
                  fill
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/82 via-transparent to-transparent" />
                <Image
                  src={logoImage}
                  alt="Spice Fusion logo"
                  width={220}
                  height={120}
                  className="absolute bottom-6 left-6 h-auto w-44 drop-shadow-[0_18px_30px_rgba(0,0,0,.5)]"
                />
              </div>
            </div>
            <div className="absolute -bottom-7 -left-8 rounded-3xl bg-[#F4B400] p-5 text-[#121212] shadow-[0_24px_70px_rgba(0,0,0,.3)]">
              <p className="text-xs font-black uppercase tracking-[0.16em]">Open tonight</p>
              <p className="mt-1 text-xl font-semibold">5:30pm - 10:30pm</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-[#FFFFFF] px-4 py-14 text-[#121212] sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.88fr_1.12fr] lg:items-center">
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-[#121212] shadow-[0_30px_90px_rgba(18,18,18,.18)]">
              <Image
                src={foodImages.exterior}
                alt="Spice Fusion takeaway storefront style image"
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-5 right-5 rounded-3xl border border-black/10 bg-white p-5 shadow-[0_24px_70px_rgba(18,18,18,.16)] sm:left-auto sm:right-8 sm:w-72">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E52B2B] text-white">
                  <Heart size={20} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#E52B2B]">Local favourite</p>
                  <p className="mt-1 font-semibold">Made for takeaway evenings</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 lg:pt-0">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E52B2B]">Our Story</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl">
              A Spice Fusion night should feel easy before the first bite.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#4B4B4B]">
              Built around classic Indian takeaway comfort, Spice Fusion brings
              together tandoori heat, creamy mild favourites, house balti
              flavours and family set meals. The goal is simple: clear ordering,
              generous food and reliable collection or delivery.
            </p>
            <div className="mt-7 grid gap-3">
              {storyPoints.map((point) => (
                <div key={point} className="flex gap-3 rounded-2xl bg-[#F5F5F5] p-4">
                  <CircleCheck className="mt-0.5 shrink-0 text-[#E52B2B]" size={20} aria-hidden="true" />
                  <p className="text-sm font-semibold leading-6 text-[#242424]">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F4B400] px-4 py-16 text-[#121212] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E52B2B]">How it works</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Order without second-guessing.</h2>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {orderSteps.map(({ Icon, title, text }, index) => (
              <article key={title} className="relative overflow-hidden rounded-[1.75rem] bg-white p-6 shadow-[0_24px_70px_rgba(18,18,18,.13)]">
                <span className="absolute right-5 top-4 text-7xl font-semibold leading-none text-[#F5F5F5]">
                  0{index + 1}
                </span>
                <Icon className="relative text-[#E52B2B]" size={28} aria-hidden="true" />
                <h3 className="relative mt-5 text-2xl font-semibold">{title}</h3>
                <p className="relative mt-3 text-sm leading-7 text-[#555]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#121212] px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F4B400]">Popular Picks</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
                Real menu favourites, easy to choose.
              </h2>
            </div>
            <Link href="/menu" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-[#121212] transition hover:bg-[#F4B400]">
              View full menu
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {featuredDishes.map((dish) => (
              <article key={dish.name} className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/8 p-5 transition hover:-translate-y-1 hover:border-[#F4B400]/70">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem] bg-white/10">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="mt-5 inline-flex rounded-full bg-[#E52B2B] px-3 py-1 text-xs font-black uppercase tracking-wide">
                  {dish.badge}
                </p>
                <h3 className="mt-3 text-2xl font-semibold">{dish.name}</h3>
                <p className="mt-3 text-sm leading-7 text-white/68">{dish.description}</p>
                <p className="mt-4 text-2xl font-semibold text-[#F4B400]">£{dish.price}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F5F5F5] px-4 py-14 text-[#121212] sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E52B2B]">Menu Sections</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">A menu built for every craving.</h2>
              <p className="mt-4 text-sm leading-7 text-[#555]">
                Jump into the full menu for prices, sections and quick ordering.
                From mild creamy dishes to very hot chilli choices, there is a
                clear route to tonight's order.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {menuCategories.slice(0, 10).map((category) => (
                <Link
                  key={category.name}
                  href="/menu"
                  className="group rounded-3xl border border-black/8 bg-white p-5 shadow-[0_16px_45px_rgba(18,18,18,.06)] transition hover:-translate-y-1 hover:border-[#E52B2B]/50 hover:shadow-[0_24px_70px_rgba(18,18,18,.11)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#E52B2B]">
                        {category.count}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold group-hover:text-[#E52B2B]">{category.name}</h3>
                    </div>
                    <ArrowRight className="mt-1 text-[#E52B2B] transition group-hover:translate-x-1" size={18} aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#666]">{category.detail}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#FFFFFF] px-4 py-14 text-[#121212] sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.08fr_.92fr] lg:items-stretch">
          <div className="overflow-hidden rounded-[2rem] bg-[#121212] text-white shadow-[0_30px_90px_rgba(18,18,18,.18)]">
            <div className="grid min-h-full gap-0 md:grid-cols-[.9fr_1.1fr]">
              <div className="relative min-h-[300px]">
                <Image
                  src={foodImages.starters}
                  alt="Spice Fusion appetisers with onion bhaji, samosa and pakora"
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/86 via-transparent to-transparent" />
              </div>
              <div className="p-6 sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F4B400]">Plan Your Order</p>
                <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">Before you checkout.</h2>
                <div className="mt-7 grid gap-4">
                  {offers.map((offer) => (
                    <div key={offer.title} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                      <Truck className="text-[#F4B400]" size={20} aria-hidden="true" />
                      <h3 className="mt-3 font-semibold">{offer.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-white/68">{offer.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="grid gap-4">
            <div className="rounded-[2rem] bg-[#E52B2B] p-6 text-white sm:p-8">
              <ChefHat size={28} aria-hidden="true" />
              <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#F4B400]">Tonight's easy choice</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Call, collect, or order online.</h2>
              <p className="mt-4 text-sm leading-7 text-white/78">
                Open Tuesday to Sunday, 5:30pm - 10:30pm. Closed Mondays except Bank Holidays.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/menu" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-[#121212] transition hover:bg-[#F4B400]">
                  <ShoppingBag size={17} aria-hidden="true" />
                  Order online
                </Link>
                <a href={restaurant.phoneHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/24 px-5 text-sm font-black text-white transition hover:border-[#F4B400] hover:text-[#F4B400]">
                  <Phone size={17} aria-hidden="true" />
                  Call now
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-black/8 bg-[#F5F5F5] p-6 sm:p-8">
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black">
                  <Clock className="text-[#E52B2B]" size={16} aria-hidden="true" />
                  Open 6 days
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black">
                  <ShieldCheck className="text-[#E52B2B]" size={16} aria-hidden="true" />
                  Hygiene rating 3
                </span>
              </div>
              <p className="mt-5 text-sm leading-7 text-[#555]">
                Need directions? Open the Google listing for maps, route
                planning and customer reviews without repeating the footer
                contact block.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={restaurant.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#121212] px-5 text-sm font-black text-white transition hover:bg-[#E52B2B]"
                >
                  <MapPin size={17} aria-hidden="true" />
                  Open map
                  <ExternalLink size={15} aria-hidden="true" />
                </a>
                <a
                  href={restaurant.googleReviewsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-black text-[#121212] transition hover:border-[#E52B2B]"
                >
                  <Star size={17} aria-hidden="true" />
                  Google listing
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
