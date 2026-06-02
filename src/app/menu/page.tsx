import type { Metadata } from "next";
import { MenuOrderClient } from "@/components/MenuOrderClient";
import {
  createBreadcrumbJsonLd,
  createMenuJsonLd,
  createPageMetadata,
  jsonLdMarkup,
  seoPages,
  shouldRenderJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(seoPages.menu);

const menuJsonLd = createMenuJsonLd();
const breadcrumbJsonLd = createBreadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Menu", path: "/menu" },
]);

export default function MenuPage() {
  return (
    <main className="bg-[#F5F5F5] text-[#121212]">
      {shouldRenderJsonLd ? (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={jsonLdMarkup(menuJsonLd)}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={jsonLdMarkup(breadcrumbJsonLd)}
          />
        </>
      ) : null}
      <MenuOrderClient />
    </main>
  );
}



