import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: "/", priority: 1 },
    { path: "/menu", priority: 0.95 },
    { path: "/contact", priority: 0.9 },
    { path: "/gallery", priority: 0.8 },
    { path: "/reviews", priority: 0.75 },
    { path: "/faqs", priority: 0.7 },
  ];

  return pages.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: page.priority,
  }));
}


