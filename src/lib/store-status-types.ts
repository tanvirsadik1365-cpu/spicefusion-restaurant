export type StoreOrderingStatus = "busy" | "closed" | "open" | "paused";

export type PublicStoreStatus = {
  acceptingPreorders?: boolean;
  label: string;
  message: string;
  orderingAllowed: boolean;
  prepTimeMinutes: number;
  status: StoreOrderingStatus;
};
