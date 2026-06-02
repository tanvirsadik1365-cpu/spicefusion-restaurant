import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type {
  PublicStoreStatus,
  StoreOrderingStatus,
} from "@/lib/store-status-types";
import { getAutomaticOrderingWindow } from "@/lib/opening-hours";

type UnknownRecord = Record<string, unknown>;

const fallbackPrepTimeMinutes = 20;
const fallbackSupportPhone = "+44 1943 830864";

export type MerchantStoreStatus = PublicStoreStatus & {
  supportPhone: string;
  updatedAt: string | null;
};

function getRestaurantId() {
  return process.env.RESTAURANT_ID?.trim() || "spicefusion-restaurant";
}

function readString(row: UnknownRecord | null | undefined, key: string) {
  const value = row?.[key];

  return typeof value === "string" ? value.trim() : "";
}

function readNumber(
  row: UnknownRecord | null | undefined,
  key: string,
  fallback: number,
) {
  const value = row?.[key];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);

    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function normalizeStatus(value: string): StoreOrderingStatus {
  if (
    value === "busy" ||
    value === "closed" ||
    value === "open" ||
    value === "paused"
  ) {
    return value;
  }

  return "open";
}

function assertStoreStatus(value: string): asserts value is StoreOrderingStatus {
  if (
    value !== "busy" &&
    value !== "closed" &&
    value !== "open" &&
    value !== "paused"
  ) {
    throw new Error("Choose open, busy, paused, or closed.");
  }
}

function clampPrepTime(value: number) {
  return Math.min(Math.max(value, 5), 120);
}

function buildPublicStatus(
  status: StoreOrderingStatus,
  prepTimeMinutes: number,
): PublicStoreStatus {
  const orderingWindow = getAutomaticOrderingWindow();
  const effectivePrepTimeMinutes =
    status === "busy" ? Math.max(prepTimeMinutes, 30) : prepTimeMinutes;

  if ((status === "open" || status === "busy") && !orderingWindow.isOpenNow) {
    return {
      acceptingPreorders: true,
      label: "Pre-order",
      message: orderingWindow.message,
      orderingAllowed: true,
      prepTimeMinutes: effectivePrepTimeMinutes,
      status: "closed",
    };
  }

  switch (status) {
    case "busy":
      return {
        acceptingPreorders: false,
        label: "Busy",
        message: `Ordering is open. Prep time is longer, around ${effectivePrepTimeMinutes} minutes.`,
        orderingAllowed: true,
        prepTimeMinutes: effectivePrepTimeMinutes,
        status,
      };
    case "paused":
      return {
        acceptingPreorders: false,
        label: "Paused",
        message: "Online ordering is temporarily unavailable.",
        orderingAllowed: false,
        prepTimeMinutes,
        status,
      };
    case "closed":
      return {
        acceptingPreorders: false,
        label: "Closed",
        message: "The restaurant is closed, so online ordering is disabled.",
        orderingAllowed: false,
        prepTimeMinutes,
        status,
      };
    case "open":
      return {
        acceptingPreorders: false,
        label: "Open",
        message: `${orderingWindow.message} Prep time is around ${prepTimeMinutes} minutes.`,
        orderingAllowed: true,
        prepTimeMinutes,
        status,
      };
  }
}

export async function getPublicStoreStatus(): Promise<PublicStoreStatus> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("restaurant_operations")
      .select("store_status, prep_time_minutes")
      .eq("restaurant_id", getRestaurantId())
      .maybeSingle();

    if (error || !data || typeof data !== "object") {
      return buildPublicStatus("open", fallbackPrepTimeMinutes);
    }

    const row = data as UnknownRecord;
    const status = normalizeStatus(readString(row, "store_status"));
    const prepTimeMinutes = clampPrepTime(
      readNumber(row, "prep_time_minutes", fallbackPrepTimeMinutes),
    );

    return buildPublicStatus(status, prepTimeMinutes);
  } catch {
    return buildPublicStatus("open", fallbackPrepTimeMinutes);
  }
}

function mapMerchantStoreStatus(row: UnknownRecord): MerchantStoreStatus {
  const status = normalizeStatus(readString(row, "store_status"));
  const prepTimeMinutes = clampPrepTime(
    readNumber(row, "prep_time_minutes", fallbackPrepTimeMinutes),
  );
  const publicStatus = buildPublicStatus(status, prepTimeMinutes);
  const supportPhone = readString(row, "support_phone") || fallbackSupportPhone;
  const updatedAt = readString(row, "updated_at") || null;

  return {
    ...publicStatus,
    supportPhone,
    updatedAt,
  };
}

export async function getMerchantStoreStatus(): Promise<MerchantStoreStatus> {
  const { data, error } = await getSupabaseAdmin()
    .from("restaurant_operations")
    .select("store_status, prep_time_minutes, support_phone, updated_at")
    .eq("restaurant_id", getRestaurantId())
    .maybeSingle();

  if (error) {
    throw new Error(
      `Store status could not be loaded: ${error.message ?? "Unknown database error."}`,
    );
  }

  if (!data || typeof data !== "object") {
    return {
      ...buildPublicStatus("open", fallbackPrepTimeMinutes),
      supportPhone: fallbackSupportPhone,
      updatedAt: null,
    };
  }

  return mapMerchantStoreStatus(data as UnknownRecord);
}

export async function updateMerchantStoreStatus({
  prepTimeMinutes,
  status,
  supportPhone,
}: {
  prepTimeMinutes: number;
  status: string;
  supportPhone?: string | null;
}) {
  assertStoreStatus(status);

  const cleanSupportPhone = supportPhone?.trim() || fallbackSupportPhone;
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("restaurant_operations")
    .upsert(
      {
        prep_time_minutes: clampPrepTime(prepTimeMinutes),
        restaurant_id: getRestaurantId(),
        store_status: status,
        support_phone: cleanSupportPhone.slice(0, 80),
        updated_at: now,
      },
      {
        onConflict: "restaurant_id",
      },
    )
    .select("store_status, prep_time_minutes, support_phone, updated_at")
    .single();

  if (error || !data || typeof data !== "object") {
    throw new Error(
      `Store status could not be updated: ${error?.message ?? "Unknown database error."}`,
    );
  }

  return mapMerchantStoreStatus(data as UnknownRecord);
}
