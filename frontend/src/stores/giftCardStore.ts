import { create } from "zustand";
import { api } from "@/lib/api";

export interface GiftCard {
  id: string;
  code: string;
  displayCode: string;
  initialAmount: number;
  currentBalance: number;
  currency: string;
  status: "ACTIVE" | "USED" | "EXPIRED" | "DEACTIVATED";
  expiresAt?: string;
  activatedAt?: string;
  usedAt?: string;
  purchaserId?: string;
  purchaserEmail?: string;
  purchaserName?: string;
  recipientEmail?: string;
  recipientName?: string;
  recipientPhone?: string;
  message?: string;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
}

interface GiftCardState {
  giftCards: GiftCard[];
  isLoading: boolean;
  error: string | null;
  fetchGiftCards: () => Promise<void>;
}

export const useGiftCardStore = create<GiftCardState>((set) => ({
  giftCards: [],
  isLoading: false,
  error: null,

  fetchGiftCards: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<GiftCard[]>("/api/gift-cards");
      set({ giftCards: response.data, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch gift cards",
        isLoading: false,
      });
    }
  },
}));
