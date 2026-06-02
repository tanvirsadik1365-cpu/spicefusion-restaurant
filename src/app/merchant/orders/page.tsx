import type { Metadata, Viewport } from "next";
import { LockKeyhole } from "lucide-react";
import { MerchantAppUpdater } from "@/components/MerchantAppUpdater";
import { MerchantLoginForm } from "@/components/MerchantLoginForm";
import { MerchantOrdersClient } from "@/components/MerchantOrdersClient";
import {
  isValidMerchantOrderDate,
  listMerchantOrders,
  type MerchantOrder,
} from "@/lib/database-orders";
import {
  isMerchantAuthConfigured,
  isMerchantPageAuthorized,
} from "@/lib/merchant-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Merchant Orders",
  description: "Merchant view of Spice Fusion TAKEAWAY website orders.",
  manifest: "/merchant-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Spice Fusion TAKEAWAY Merchant",
  },
};

export const viewport: Viewport = {
  themeColor: "#121212",
};

type MerchantOrdersPageProps = {
  searchParams: Promise<{
    date?: string;
  }>;
};

function MerchantGate({ message }: { message: string }) {
  return (
    <main className="bg-white px-4 py-16 text-[#121212] sm:px-6 lg:px-8">
      <MerchantAppUpdater />
      <section className="spice-card mx-auto max-w-2xl rounded-lg p-8 text-center">
        <LockKeyhole className="mx-auto text-[#121212]" size={44} aria-hidden="true" />
        <h1 className="mt-5 text-3xl font-black">Merchant access needed</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#5F5A53]">
          {message}
        </p>
        {isMerchantAuthConfigured() ? <MerchantLoginForm /> : null}
      </section>
    </main>
  );
}

export default async function MerchantOrdersPage({
  searchParams,
}: MerchantOrdersPageProps) {
  const params = await searchParams;

  if (!isMerchantAuthConfigured()) {
    return (
      <MerchantGate
        message="Set MERCHANT_DASHBOARD_TOKEN in the server environment, then restart the app."
      />
    );
  }

  if (!(await isMerchantPageAuthorized())) {
    return (
      <MerchantGate
        message="Enter the private dashboard token. It will be stored in a secure HttpOnly session cookie, not in the URL."
      />
    );
  }

  const initialOrderDate = params.date?.trim() || "";
  let orders: MerchantOrder[] = [];
  let loadError = "";

  if (initialOrderDate && !isValidMerchantOrderDate(initialOrderDate)) {
    loadError = "Choose a valid order date.";
  } else {
    try {
      orders = await listMerchantOrders({ orderDate: initialOrderDate });
    } catch (error) {
      loadError =
        error instanceof Error ? error.message : "Orders could not be loaded.";
    }
  }

  return (
    <main className="bg-white px-4 py-10 text-[#121212] sm:px-6 lg:px-8">
      <MerchantAppUpdater />
      <section className="mx-auto max-w-6xl">
        <MerchantOrdersClient
          initialError={loadError}
          initialOrderDate={initialOrderDate}
          initialOrders={orders}
        />
      </section>
    </main>
  );
}




