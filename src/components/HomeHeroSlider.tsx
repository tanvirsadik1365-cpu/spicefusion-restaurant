"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

type HeroSlide = {
  alt: string;
  eyebrow: string;
  image: string;
  summary: string;
  title: string;
};

type HomeHeroSliderProps = {
  slides: HeroSlide[];
};

const slideDelay = 5200;

export function HomeHeroSlider({ slides }: HomeHeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, slideDelay);

    return () => window.clearInterval(timer);
  }, [isPaused, slides.length]);

  const activeSlide = slides[activeIndex];

  return (
    <div
      className="hero-showcase relative w-full min-w-0 max-w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="relative rounded-lg bg-[linear-gradient(145deg,rgba(255,255,255,0.75),rgba(244,235,221,0.25))] p-2 shadow-[0_24px_70px_rgba(18,18,18,0.14)]">
        <div className="overflow-hidden rounded-md border border-[var(--brand-line)] bg-[var(--brand-ink)]">
          <div className="relative aspect-[5/4] min-h-[370px] sm:min-h-[470px] lg:aspect-[10/11] lg:min-h-[570px]">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;

            return (
              <Image
                key={slide.title}
                src={slide.image}
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 44vw, 100vw"
                className={`object-cover transition duration-1000 ease-out ${
                  isActive ? "scale-100 opacity-100" : "scale-105 opacity-0"
                }`}
              />
            );
          })}

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(33,26,24,0.02)_0%,rgba(33,26,24,0.1)_38%,rgba(33,26,24,0.92)_100%)]" />
            <div className="absolute left-4 top-4 rounded-full border border-white/16 bg-black/30 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white/82 backdrop-blur">
              Addingham LS29
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6 lg:p-7">
            <div className="overflow-hidden">
              <p
                key={`${activeSlide.title}-eyebrow`}
                className="hero-slide-copy text-xs font-black uppercase tracking-[0.18em] text-white/76"
              >
                {activeSlide.eyebrow}
              </p>
              <h2
                key={`${activeSlide.title}-title`}
                className="hero-slide-copy mt-2 max-w-sm text-3xl font-black leading-tight sm:text-4xl"
              >
                {activeSlide.title}
              </h2>
              <p
                key={`${activeSlide.title}-summary`}
                className="hero-slide-copy mt-3 max-w-md text-sm font-semibold leading-6 text-white/78"
              >
                {activeSlide.summary}
              </p>
            </div>
          </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-white/12 bg-[var(--brand-ink)]/96 p-2">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={slide.title}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`group relative flex min-h-[74px] items-center gap-2 rounded-md p-2 text-left transition duration-300 sm:min-h-20 ${
                  isActive ? "bg-white/12" : "hover:bg-white/8"
                }`}
                aria-label={`Show ${slide.eyebrow}`}
              >
                <span className="relative hidden h-12 w-12 shrink-0 overflow-hidden rounded-md sm:block">
                  <Image
                    src={slide.image}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-black uppercase tracking-[0.08em] text-white/62">
                    {slide.eyebrow}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-xs font-black leading-tight text-white sm:text-sm">
                    <span className="truncate">{slide.title}</span>
                    {isActive ? (
                      <ArrowRight
                        className="shrink-0"
                        size={14}
                        aria-hidden="true"
                      />
                    ) : null}
                  </span>
                </span>
                {isActive ? (
                  <span className="absolute inset-x-2 bottom-1 h-0.5 overflow-hidden rounded-full bg-white/16">
                    <span className="hero-slide-progress block h-full rounded-full bg-[var(--brand-accent)]" />
                  </span>
                ) : null}
              </button>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}


