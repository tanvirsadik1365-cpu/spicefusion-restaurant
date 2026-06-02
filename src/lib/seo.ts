import type { Metadata } from "next";
import { faqs, foodImages, galleryImages, menuSections, restaurant, reviews } from "@/lib/restaurant";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? restaurant.siteUrl;
export const ogImageUrl = `${siteUrl}/og-image.jpg`;
export const shouldRenderJsonLd = false;

export const seoPages = {
  home: { path: "/", title: "Spice Fusion TAKEAWAY", description: "Order takeaway online from Spice Fusion TAKEAWAY." },
  menu: { path: "/menu", title: "Menu | Spice Fusion TAKEAWAY", description: "Browse the full Spice Fusion TAKEAWAY menu." },
  gallery: { path: "/gallery", title: "Gallery | Spice Fusion TAKEAWAY", description: "Food and brand gallery of Spice Fusion TAKEAWAY." },
  reviews: { path: "/reviews", title: "Reviews | Spice Fusion TAKEAWAY", description: "Customer reviews for Spice Fusion TAKEAWAY." },
  contact: { path: "/contact", title: "Contact | Spice Fusion TAKEAWAY", description: "Call or contact Spice Fusion TAKEAWAY." },
} as const;

type SeoPage = (typeof seoPages)[keyof typeof seoPages];

export function absoluteUrl(path = "/") {
  return path === "/" ? `${siteUrl}/` : `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createPageMetadata(page: SeoPage): Metadata {
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: absoluteUrl(page.path) },
  };
}

export function jsonLdMarkup(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

export function createBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function createGlobalRestaurantJsonLd() {
  return { "@context": "https://schema.org", "@type": "Restaurant", name: restaurant.name, url: absoluteUrl("/") };
}

export function createMenuJsonLd() {
  return { "@context": "https://schema.org", "@type": "Menu", name: "Menu", hasMenuSection: menuSections.map((s) => ({ "@type": "MenuSection", name: s.title })) };
}

export function createFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
  };
}

export function createReviewsJsonLd() {
  return { "@context": "https://schema.org", "@type": "ItemList", numberOfItems: reviews.length };
}

export function createGalleryJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    image: [foodImages.curry, ...galleryImages.map((img) => img.src)],
  };
}



