import type { Metadata } from "next";
import type { DishSeoPage } from "@/lib/menu-seo";
import {
  faqs,
  foodImages,
  galleryImages,
  menuSections,
  restaurant,
  reviews,
} from "@/lib/restaurant";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? restaurant.siteUrl;
export const ogImageUrl = `${siteUrl}${foodImages.hero}`;
export const shouldRenderJsonLd = true;

export const seoPages = {
  home: {
    path: "/",
    title: "Spice Fusion Takeaway | Indian Takeaway & Curry Delivery Addingham",
    description:
      "Order authentic Indian and Bangladeshi food online from Spice Fusion Takeaway Addingham. Enjoy curry, biryani, tandoori grills and exclusive collection and delivery offers.",
  },
  menu: {
    path: "/menu",
    title:
      "Indian Takeaway Menu Addingham | Curry, Biryani & Tandoori | Spice Fusion",
    description:
      "Browse the Spice Fusion menu. Order authentic Indian curry, biryani, tandoori grills, kebabs, vegetarian dishes and Bangladeshi specialities online.",
  },
  gallery: {
    path: "/gallery",
    title: "Indian Food Gallery Addingham | Spice Fusion Takeaway",
    description:
      "View authentic Indian dishes, curries, kebabs, biryanis and customer favourites from Spice Fusion Takeaway.",
  },
  reviews: {
    path: "/reviews",
    title: "Customer Reviews | Spice Fusion Takeaway Addingham",
    description:
      "Read customer reviews and discover why local customers choose Spice Fusion for authentic Indian takeaway and curry delivery.",
  },
  contact: {
    path: "/contact",
    title: "Contact Spice Fusion Takeaway Addingham",
    description:
      "Contact Spice Fusion Takeaway for takeaway orders, delivery enquiries and customer support.",
  },
} as const;

type SeoPage = {
  path: string;
  title: string;
  description: string;
};

export function absoluteUrl(path = "/") {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return path === "/"
    ? `${siteUrl}/`
    : `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createPageMetadata(page: SeoPage): Metadata {
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: absoluteUrl(page.path) },
    openGraph: {
      title: page.title,
      description: page.description,
      url: absoluteUrl(page.path),
      siteName: restaurant.name,
      locale: "en_GB",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: restaurant.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [ogImageUrl],
    },
  };
}

export function createDishMetadata(page: DishSeoPage): Metadata {
  return createPageMetadata({
    path: `/menu/${page.slug}`,
    title: page.title,
    description: page.description,
  });
}

export function jsonLdMarkup(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

export function createBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
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
  return {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "LocalBusiness"],
    "@id": absoluteUrl("/#restaurant"),
    name: restaurant.name,
    alternateName: "Spice Fusion Takeaway",
    description:
      "Indian takeaway and Bangladeshi cuisine in Addingham, Ilkley LS29, serving curry, biryani, tandoori grills, kebabs and vegetarian dishes.",
    url: absoluteUrl("/"),
    telephone: restaurant.phone,
    email: restaurant.email,
    image: absoluteUrl(foodImages.hero),
    logo: absoluteUrl("/brand/spice-fusion-logo.png"),
    priceRange: "££",
    servesCuisine: ["Indian", "Bangladeshi", "Curry", "Biryani", "Tandoori"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "137 Main St",
      addressLocality: "Addingham",
      addressRegion: "West Yorkshire",
      postalCode: "LS29 0LZ",
      addressCountry: "GB",
    },
    areaServed: [
      "Addingham",
      "Ilkley",
      "LS29",
      "West Yorkshire",
      "Skipton",
      "Keighley",
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "17:30",
        closes: "22:30",
      },
    ],
    hasMenu: absoluteUrl("/menu"),
    acceptsReservations: false,
    sameAs: [
      restaurant.facebookUrl,
      restaurant.instagramUrl,
      restaurant.googleReviewsUrl,
    ].filter(Boolean),
    makesOffer: [
      {
        "@type": "Offer",
        name: "15% off collection orders",
        availability: "https://schema.org/InStock",
        areaServed: "Addingham",
      },
      {
        "@type": "Offer",
        name: "10% off delivery orders",
        availability: "https://schema.org/InStock",
        areaServed: "Within 5 miles of Addingham, maximum 7 miles",
      },
    ],
  };
}

export function createMenuJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": absoluteUrl("/menu#menu"),
    name: "Spice Fusion Indian Takeaway Menu",
    url: absoluteUrl("/menu"),
    hasMenuSection: menuSections.map((section) => ({
      "@type": "MenuSection",
      name: section.title,
      description: section.description,
      hasMenuItem: section.items.map((item) => ({
        "@type": "MenuItem",
        name: item.name,
        description: item.description ?? section.description,
        offers: {
          "@type": "Offer",
          price: item.price,
          priceCurrency: "GBP",
          availability: "https://schema.org/InStock",
        },
      })),
    })),
  };
}

export function createFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function createReviewsJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Restaurant",
      name: restaurant.name,
      address: restaurant.location,
    },
    reviewRating: { "@type": "Rating", ratingValue: "4.8", bestRating: "5" },
    author: { "@type": "Person", name: reviews[0]?.name ?? "Customer" },
    reviewBody: reviews[0]?.text ?? "Customer reviews for Spice Fusion Takeaway.",
  };
}

export function createGalleryJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "Spice Fusion Food Gallery",
    image: [foodImages.curry, ...galleryImages.map((img) => img.src)].map(
      absoluteUrl,
    ),
  };
}

export function createDishJsonLd(page: DishSeoPage) {
  return {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: page.name,
    description: page.description,
    image: absoluteUrl(page.image),
    url: absoluteUrl(`/menu/${page.slug}`),
    menuAddOn: ["Pilau rice", "Naan", "Vegetable side dishes"],
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "GBP",
      url: absoluteUrl("/menu"),
    },
    provider: {
      "@type": "Restaurant",
      name: restaurant.name,
      telephone: restaurant.phone,
      address: restaurant.location,
    },
  };
}

export function createDishFaqJsonLd(page: DishSeoPage) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
