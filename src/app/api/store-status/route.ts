import { NextResponse, type NextRequest } from "next/server";
import { getPublicStoreStatus } from "@/lib/store-status";
import { rateLimitRequestSmart } from "@/lib/request-protection";

export const runtime = "nodejs";

const fallbackStoreStatus = {
  label: "Open",
  message: "Ordering is open. Prep time is around 20 minutes.",
  orderingAllowed: true,
  prepTimeMinutes: 20,
  status: "open" as const,
};

export async function GET(request: NextRequest) {
  const rateLimitError = await rateLimitRequestSmart(request, {
    key: "public-store-status",
    limit: 40,
    windowMs: 60_000,
  });

  if (rateLimitError) {
    return rateLimitError;
  }

  const storeStatus = await getPublicStoreStatus().catch(() => fallbackStoreStatus);

  return NextResponse.json(
    { storeStatus },
    {
      headers: {
        "Cache-Control": "public, s-maxage=20, stale-while-revalidate=120",
      },
    },
  );
}

