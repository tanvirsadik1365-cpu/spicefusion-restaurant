import type { Metadata, Viewport } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import { CookieConsentManager } from "@/components/CookieConsentManager";
import { OfferPopup } from "@/components/OfferPopup";
import { SeoTracking } from "@/components/SeoTracking";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { restaurant } from "@/lib/restaurant";
import {
  createGlobalRestaurantJsonLd,
  jsonLdMarkup,
  ogImageUrl,
  seoPages,
  shouldRenderJsonLd,
  siteUrl,
} from "@/lib/seo";
import "./globals.css";

const googleTagManagerId = "";
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});


const browserExtensionHydrationCleanupScript = `
(() => {
  const shouldRemoveAttribute = (name) =>
    name === "cz-shortcut-listen" ||
    name.startsWith("bis_") ||
    name.startsWith("__processed_");

  const cleanElement = (element) => {
    for (const { name } of Array.from(element.attributes)) {
      if (shouldRemoveAttribute(name)) {
        element.removeAttribute(name);
      }
    }
  };

  const cleanTree = (root) => {
    if (root.nodeType === Node.ELEMENT_NODE) {
      cleanElement(root);
    }

    if (typeof root.querySelectorAll === "function") {
      root.querySelectorAll("*").forEach(cleanElement);
    }
  };

  const cleanDocument = () => {
    if (document.documentElement) {
      cleanTree(document.documentElement);
    }
  };

  cleanDocument();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.target.nodeType === Node.ELEMENT_NODE) {
        cleanElement(mutation.target);
      }

      if (mutation.type === "childList") {
        mutation.addedNodes.forEach(cleanTree);
      }
    }
  });

  if (document.documentElement) {
    observer.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }

  document.addEventListener("DOMContentLoaded", cleanDocument, { once: true });
  window.addEventListener("load", cleanDocument, { once: true });
  window.setTimeout(() => {
    cleanDocument();
    observer.disconnect();
  }, 5000);
})();
`;

const metadataBaseUrl = (() => {
  try {
    return new URL(siteUrl);
  } catch {
    return new URL("https://example.com");
  }
})();

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl,
  applicationName: restaurant.name,
  title: {
    default: seoPages.home.title,
    template: "%s",
  },
  description: seoPages.home.description,
  authors: [{ name: "Spice Fusion TAKEAWAY", url: siteUrl }],
  creator: "Spice Fusion TAKEAWAY",
  publisher: "Spice Fusion TAKEAWAY",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  keywords: ["takeaway", "indian takeaway", "spice fusion", "menu", "delivery", "LS29"],
  icons: {
    icon: [
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/favicon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spice Fusion TAKEAWAY",
    description: "Order takeaway online from Spice Fusion TAKEAWAY.",
    images: [ogImageUrl],
  },
  openGraph: {
    type: "website",
    title: "Spice Fusion TAKEAWAY",
    description: "Order takeaway online from Spice Fusion TAKEAWAY.",
    url: `${siteUrl}/`,
    siteName: "Spice Fusion TAKEAWAY",
    locale: "en_GB",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "Spice Fusion TAKEAWAY",
      },
    ],
  },
  other: { author: "Spice Fusion TAKEAWAY" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#121212",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={`${poppins.variable} ${playfair.variable} flex min-h-full flex-col`}
        suppressHydrationWarning
      >
        {shouldRenderJsonLd ? (
          <script
            id="restaurant-structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={jsonLdMarkup(createGlobalRestaurantJsonLd())}
          />
        ) : null}
        <CartProvider>
          {process.env.NODE_ENV === "development" ? (
            <script
              id="browser-extension-hydration-cleanup"
              dangerouslySetInnerHTML={{
                __html: browserExtensionHydrationCleanupScript,
              }}
            />
          ) : null}
          <CookieConsentManager gtmId={googleTagManagerId} metaPixelId={metaPixelId} />
          <SeoTracking />
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <OfferPopup />
        </CartProvider>
      </body>
    </html>
  );
}


