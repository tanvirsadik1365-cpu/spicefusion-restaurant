"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone, Camera, Utensils } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { restaurant, type GalleryImageData } from "@/lib/restaurant";

type GalleryImage = GalleryImageData;

type GalleryGridProps = {
  images: GalleryImage[];
};

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function GalleryLink({
  href,
  className,
  children,
  ariaLabel,
}: {
  ariaLabel?: string;
  children: React.ReactNode;
  className: string;
  href: string;
}) {
  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        className={className}
        aria-label={ariaLabel}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

function getImageAlt(image: GalleryImage) {
  return image.alt ?? `${image.title} at ${restaurant.name}`;
}

export function GalleryGrid({ images }: GalleryGridProps) {
  const heroImage = images[0];

  const heroCards = useMemo(() => {
    return images
      .filter((image) => image.category !== "Restaurant" && image.category !== "Drinks")
      .slice(0, 3);
  }, [images]);

  if (!heroImage) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[#F5F5F5] text-[#121212]">
      <section className="relative isolate overflow-hidden px-4 pb-8 pt-52 sm:px-6 sm:py-12 lg:min-h-[calc(100svh-76px)] lg:px-8 lg:py-14">
        <Image
          src={heroImage.src}
          alt={getImageAlt(heroImage)}
          fill
          priority
          sizes="100vw"
          className="cinematic-hero-image object-cover opacity-70"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,0.96)_0%,rgba(8,8,8,0.84)_45%,rgba(8,8,8,0.35)_100%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,0.2)_0%,rgba(18,18,18,0.72)_68%,rgba(18,18,18,0.9)_100%)]"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 lg:min-h-[calc(100svh-150px)] lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.58fr)] lg:content-center lg:items-center lg:gap-12">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#F4B400] shadow-[0_14px_34px_rgba(0,0,0,0.32)] backdrop-blur">
              <Camera size={15} aria-hidden="true" />
              Gallery
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.98] text-white sm:text-6xl lg:mt-6 lg:text-[6.2rem]">
              Spice Fusion Takeaway Food Gallery
            </h1>
            <p className="mt-6 max-w-2xl text-base font-semibold leading-8 text-[#FFF1D1] sm:text-lg">
              Spice Fusion TAKEAWAY specials, tandoor smoke, biryani, vegetarian dishes and
              customer favourites from Spice Fusion TAKEAWAY in Addingham.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <GalleryLink
                href="/menu"
                className="inline-flex h-12 min-h-12 items-center justify-center gap-2 rounded-full bg-[#E52B2B] px-6 text-sm font-black text-[#121212] shadow-[0_16px_38px_rgba(229,43,43,0.24)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                <Utensils size={17} aria-hidden="true" />
                Order online
                <ArrowRight size={16} aria-hidden="true" />
              </GalleryLink>
              <GalleryLink
                href="/contact"
                className="inline-flex h-12 min-h-12 items-center justify-center gap-2 rounded-full border border-white/16 bg-white/10 px-6 text-sm font-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.28)] backdrop-blur transition hover:border-[#E52B2B] hover:text-[#F4B400]"
              >
                <Phone size={17} aria-hidden="true" />
                Call a table
              </GalleryLink>
            </div>
          </motion.div>

          <motion.div
            initial={false}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.82, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"
          >
            {heroCards.map((image, index) => (
              <div
                key={`${image.title}-${image.src}`}
                className="group relative min-h-[150px] overflow-hidden rounded-lg border border-white/12 bg-white/8 text-left shadow-[0_22px_60px_rgba(0,0,0,0.34)] sm:min-h-[180px] lg:min-h-[172px]"
              >
                <Image
                  src={image.src}
                  alt={getImageAlt(image)}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 360px, (min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
                <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.72)_100%)]" />
                <span className="absolute bottom-4 left-4 right-4">
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-[#F4B400]">
                    {image.mood}
                  </span>
                  <span className="mt-1 block text-xl font-black text-white">
                    {image.title}
                  </span>
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="fixed bottom-6 right-6 z-40 hidden flex-col gap-2 lg:flex">
        <GalleryLink
          href="/menu"
          className="inline-flex h-12 min-h-12 items-center justify-center gap-2 rounded-full bg-[#E52B2B] px-5 text-sm font-black text-[#121212] shadow-[0_16px_38px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 hover:bg-white"
        >
          <Utensils size={17} aria-hidden="true" />
          Order
        </GalleryLink>
        <GalleryLink
          href="/contact"
          className="inline-flex h-12 min-h-12 items-center justify-center gap-2 rounded-full border border-[#cbd5e1] bg-[#ffffff] px-5 text-sm font-black text-[#121212] shadow-[0_16px_38px_rgba(0,0,0,0.26)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[#E52B2B]"
        >
          <Phone size={17} aria-hidden="true" />
          Call
        </GalleryLink>
      </div>
    </section>
  );
}






