import Image from "next/image";

type PageIntroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  imageAlt?: string;
  imageSrc?: string;
  meta?: string;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  imageAlt,
  imageSrc,
  meta,
}: PageIntroProps) {
  const hasImage = Boolean(imageSrc && imageAlt);

  return (
    <section className="border-b border-[#e5e7eb] bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div
        className={`mx-auto grid max-w-7xl gap-8 ${
          hasImage ? "lg:grid-cols-[0.88fr_0.72fr] lg:items-center" : ""
        }`}
      >
        <div className={hasImage ? "max-w-3xl" : "mx-auto max-w-3xl text-center"}>
          {eyebrow ? (
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-primary)]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 break-words text-3xl font-black leading-tight text-[var(--brand-ink)] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-[#4b5563] sm:text-lg">
            {description}
          </p>
          {meta ? (
            <p className="mt-6 inline-flex max-w-full items-center rounded-lg border border-[var(--brand-line)] bg-[#F5F5F5] px-4 py-2 text-sm font-black text-[var(--brand-primary)] shadow-sm">
              {meta}
            </p>
          ) : null}
        </div>

        {imageSrc && imageAlt ? (
          <div className="relative min-h-[240px] overflow-hidden rounded-lg border border-[var(--brand-line)] bg-white shadow-sm sm:min-h-[320px]">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover"
              preload
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(33,26,24,0)_45%,rgba(33,26,24,0.42)_100%)]"
              aria-hidden="true"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

