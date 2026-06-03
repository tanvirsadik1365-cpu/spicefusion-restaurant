"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

type Faq = {
  category: string;
  question: string;
  answer: string;
};

type FaqListProps = {
  faqs: Faq[];
};

export function FaqList({ faqs }: FaqListProps) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(faqs.map((faq) => faq.category)))],
    [faqs],
  );
  const [activeCategory, setActiveCategory] = useState("All");

  const visibleFaqs =
    activeCategory === "All"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {categories.map((category) => {
          const isActive = category === activeCategory;

          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              aria-pressed={isActive}
              className={`min-h-10 rounded-lg border px-4 text-sm font-black transition ${
                isActive
                  ? "border-[#E52B2B] bg-[#E52B2B] text-white shadow-sm"
                  : "border-black/10 bg-white text-[#4b5563] hover:border-[#E52B2B] hover:text-[#121212]"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {visibleFaqs.map((faq) => (
          <details key={faq.question} className="group spice-card rounded-lg p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-black">
              <span className="break-words">{faq.question}</span>
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#121212] text-white transition group-open:rotate-45"
                aria-hidden="true"
              >
                <Plus size={18} />
              </span>
            </summary>
            <p className="mt-4 border-t border-[#e5e7eb] pt-4 text-sm font-medium leading-7 text-[#4b5563]">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </>
  );
}



