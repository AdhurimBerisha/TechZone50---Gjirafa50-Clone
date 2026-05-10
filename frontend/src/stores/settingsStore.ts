import { create } from "zustand";

interface PublicSettings {
  storeName: string | null;
  storeEmail: string | null;
  storePhone: string | null;
  storeDescription: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  shippingPrice: number | null;
  freeShippingThreshold: number | null;
  deliveryTime: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
}

interface SettingsStore {
  settings: PublicSettings | null;
  isFetching: boolean;
  fetchPublicSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,
  isFetching: false,
  fetchPublicSettings: async () => {
    if (get().settings || get().isFetching) return;
    set({ isFetching: true });
    try {
      const res = await fetch("/api/public/settings");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: PublicSettings = await res.json();
      set({ settings: data });
    } catch (err) {
      console.error("Failed to fetch public settings:", err);
    } finally {
      set({ isFetching: false });
    }
  },
}));
