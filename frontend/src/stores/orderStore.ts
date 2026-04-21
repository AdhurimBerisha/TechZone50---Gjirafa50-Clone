import { create } from "zustand";
import { AxiosError } from "axios";
import { api } from "@/lib/api";

export type PlacedOrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
};

export type PlacedOrder = {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: PlacedOrderItem[];
};

type OrderResponse =
  | { success: true; order: PlacedOrder }
  | { success?: false; error?: string };

type FetchOrdersResponse =
  | { success: true; orders: PlacedOrder[] }
  | { success?: false; error?: string };

interface OrderState {
  isOrdering: boolean;
  orderError: string | null;
  lastOrder: PlacedOrder | null;
  orders: PlacedOrder[];
  isLoadingOrders: boolean;
  ordersError: string | null;
  clearOrderError: () => void;
  orderProduct: (
    token: string,
    productId: string,
    quantity: number,
  ) => Promise<PlacedOrder>;
  fetchOrders: (token: string) => Promise<void>;
}

function getErrorMessage(e: unknown): string {
  const axiosError = e as AxiosError<{ error?: string }>;
  if (axiosError.response?.data?.error) {
    return axiosError.response.data.error;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return "Porosia dështoi";
}

export const useOrderStore = create<OrderState>()((set) => ({
  isOrdering: false,
  orderError: null,
  lastOrder: null,
  orders: [],
  isLoadingOrders: false,
  ordersError: null,

  clearOrderError: () => set({ orderError: null }),

  fetchOrders: async (token: string) => {
    set({ isLoadingOrders: true, ordersError: null });
    try {
      const res = await api.get<FetchOrdersResponse>("/api/users/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if ("success" in res.data && res.data.success === true) {
        set({
          orders: res.data.orders,
          isLoadingOrders: false,
        });
        return;
      }
      const msg =
        "error" in res.data && res.data.error
          ? res.data.error
          : "Nuk u ngarkuan porositë";
      set({
        orders: [],
        isLoadingOrders: false,
        ordersError: msg,
      });
    } catch (e) {
      const msg = getErrorMessage(e);
      set({
        orders: [],
        isLoadingOrders: false,
        ordersError: msg,
      });
    }
  },

  orderProduct: async (token, productId, quantity) => {
    set({ isOrdering: true, orderError: null });
    try {
      const res = await api.post<OrderResponse>(
        "/api/users/order",
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if ("success" in res.data && res.data.success === true) {
        const placed = res.data.order;
        set((state) => ({
          lastOrder: placed,
          isOrdering: false,
          orders: [
            placed,
            ...state.orders.filter((o) => o.id !== placed.id),
          ],
        }));
        return placed;
      }
      const msg =
        "error" in res.data && res.data.error
          ? res.data.error
          : "Porosia dështoi";
      set({ isOrdering: false, orderError: msg });
      throw new Error(msg);
    } catch (e) {
      const msg = getErrorMessage(e);
      set({ isOrdering: false, orderError: msg });
      throw new Error(msg);
    }
  },
}));
