import type { MetadataRoute } from "next";
import { dishSeoPages } from "@/lib/menu-seo";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: "/", priority: 1 },
    { path: "/menu", priority: 0.95 },
    { path: "/booking", priority: 0.9 },
    { path: "/cart", priority: 0.85 },
    { path: "/contact", priority: 0.9 },
    { path: "/gallery", priority: 0.8 },
    { path: "/reviews", priority: 0.75 },
    { path: "/faqs", priority: 0.7 },
    ...dishSeoPages.map((page) => ({
      path: `/menu/${page.slug}`,
      priority: 0.82,
    })),
  ];

  return pages.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: page.priority,
  }));
}
