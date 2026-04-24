import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AxiosError } from "axios";
import { api } from "@/lib/api";
import type { BackendProduct } from "@/stores/productStore";

interface AdminState {
  isLoading: boolean;
  error: string | null;
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: Order[];
  recentProducts: BackendProduct[];
  recentUsers: User[];
  recentRevenue: number[];
}

interface AdminActions {
  fetchAllProducts: () => Promise<void>;
  fetchAllUsers: () => Promise<void>;
}

type AdminStore = AdminState & AdminActions;

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

const initialState: AdminState = {
  isLoading: false,
  error: null,
  totalProducts: 0,
  totalOrders: 0,
  totalUsers: 0,
  totalRevenue: 0,
  recentOrders: [],
  recentProducts: [],
  recentUsers: [],
  recentRevenue: [],
};

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      ...initialState,
      fetchAllProducts: async () => {
        try {
          set({ isLoading: true, error: null });
          const res = await api.get<{
            success: true;
            products: BackendProduct[];
          }>("/api/admin/products");
          if ("success" in res.data && res.data.success === true) {
            set({
              totalProducts: res.data.products.length,
              recentProducts: res.data.products,
              isLoading: false,
            });
          } else {
            set({ error: "Failed to fetch products", isLoading: false });
          }
        } catch (error) {
          console.error("Error fetching products:", error);
          const axiosError = error as AxiosError<{ error?: string }>;
          set({
            error:
              axiosError.response?.data?.error ?? "Failed to fetch products",
            isLoading: false,
          });
        }
      },
      fetchAllUsers: async () => {
        try {
          set({ isLoading: true, error: null });
          const res = await api.get<{ success: true; users: User[] }>(
            "/api/admin/users",
          );
          if ("success" in res.data && res.data.success === true) {
            set({
              totalUsers: res.data.users.length,
              recentUsers: res.data.users,
              isLoading: false,
            });
          } else {
            set({ error: "Failed to fetch users", isLoading: false });
          }
        } catch (error) {
          console.error("Error fetching users:", error);
          const axiosError = error as AxiosError<{ error?: string }>;
          set({
            error: axiosError.response?.data?.error ?? "Failed to fetch users",
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "techstore50-admin",
      partialize: (state) => ({ isLoading: state.isLoading }),
    },
  ),
);
