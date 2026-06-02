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
              className={`h-10 rounded-full border px-4 text-sm font-black transition ${
                isActive
                  ? "border-[#121212] bg-[#121212] text-white"
                  : "border-black/10 bg-white text-[#5F5A53] hover:border-[#121212] hover:text-[#121212]"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {visibleFaqs.map((faq) => (
          <details
            key={faq.question}
            className="group spice-card rounded-lg p-5"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-black">
              <span className="break-words">{faq.question}</span>
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#121212] text-white transition group-open:rotate-45"
                aria-hidden="true"
              >
                <Plus size={18} />
              </span>
            </summary>
            <p className="mt-4 text-sm leading-7 text-[#5F5A53]">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </>
  );
}



