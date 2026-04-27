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
  topProducts: TopProduct[];
}

export type CreateProductPayload = {
  name: string;
  slug: string;
  description?: string;
  category: string;
  categorySlug: string;
  price: number;
  oldPrice?: number | null;
  rating?: number;
  image?: string;
  images?: string[];
  stock?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  /** Slugs matching mega menu / `?sub=` for the chosen category */
  subcategorySlugs?: string[];
};

/** Body for `PUT /api/admin/products/:id` — same fields as create; all sent on save. */
export type UpdateProductPayload = CreateProductPayload;

interface AdminActions {
  fetchAllProducts: () => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  fetchTopSellingProducts: () => Promise<void>;
  createProduct: (
    payload: CreateProductPayload,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  updateProduct: (
    id: string,
    payload: UpdateProductPayload,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}

type AdminStore = AdminState & AdminActions;

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
  items?: Array<{
    id: string;
    quantity: number;
    price: number;
  }>;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TopProduct {
  id: string;
  name: string;
  image: string | null;
  category: string;
  unitsSold: number;
  revenue: number;
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
  topProducts: [],
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
      fetchDashboardStats: async () => {
        try {
          set({ isLoading: true, error: null });
          const [productsRes, usersRes] = await Promise.all([
            api.get<{ success: true; products: BackendProduct[] }>(
              "/api/admin/products",
            ),
            api.get<{ success: true; users: User[] }>("/api/admin/users"),
          ]);
          const productsOk =
            "success" in productsRes.data &&
            productsRes.data.success === true;
          const usersOk =
            "success" in usersRes.data && usersRes.data.success === true;
          if (!productsOk || !usersOk) {
            set({
              error: "Failed to load dashboard statistics",
              isLoading: false,
            });
            return;
          }
          set({
            totalProducts: productsRes.data.products.length,
            recentProducts: productsRes.data.products,
            totalUsers: usersRes.data.users.length,
            recentUsers: usersRes.data.users,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error("Error fetching dashboard stats:", error);
          const axiosError = error as AxiosError<{ error?: string }>;
          set({
            error:
              axiosError.response?.data?.error ??
              "Failed to load dashboard statistics",
            isLoading: false,
          });
        }
      },
      fetchTopSellingProducts: async () => {
        try {
          set({ isLoading: true, error: null });
          const res = await api.get<
            { success: true; topProducts: TopProduct[] } | { error: string }
          >("/api/admin/top-products");
          const data = res.data;
          if (
            "success" in data &&
            data.success === true &&
            "topProducts" in data
          ) {
            set({
              topProducts: data.topProducts,
              isLoading: false,
              error: null,
            });
          } else {
            set({ error: "Failed to fetch top products", isLoading: false });
          }
        } catch (error) {
          console.error("Error fetching top products:", error);
          const axiosError = error as AxiosError<{ error?: string }>;
          set({
            error:
              axiosError.response?.data?.error ?? "Failed to fetch top products",
            isLoading: false,
          });
        }
      },
      createProduct: async (payload) => {
        try {
          const res = await api.post<
            { success: true; product: BackendProduct } | { error: string }
          >("/api/admin/products", payload);
          const data = res.data;
          if ("success" in data && data.success === true && "product" in data) {
            const created = data.product;
            set((s) => ({
              recentProducts: [created, ...s.recentProducts],
              totalProducts: s.totalProducts + 1,
            }));
            return { ok: true as const };
          }
          const msg =
            "error" in res.data && typeof res.data.error === "string"
              ? res.data.error
              : "Failed to create product";
          return { ok: false as const, error: msg };
        } catch (error) {
          console.error("Error creating product:", error);
          const axiosError = error as AxiosError<{ error?: string }>;
          return {
            ok: false as const,
            error:
              axiosError.response?.data?.error ?? "Failed to create product",
          };
        }
      },
      updateProduct: async (id, payload) => {
        try {
          const res = await api.put<
            { success: true; product: BackendProduct } | { error: string }
          >(`/api/admin/products/${encodeURIComponent(id)}`, payload);
          const data = res.data;
          if ("success" in data && data.success === true && "product" in data) {
            const updated = data.product;
            set((s) => ({
              recentProducts: s.recentProducts.map((p) =>
                p.id === id ? updated : p,
              ),
            }));
            return { ok: true as const };
          }
          const msg =
            "error" in res.data && typeof res.data.error === "string"
              ? res.data.error
              : "Failed to update product";
          return { ok: false as const, error: msg };
        } catch (error) {
          console.error("Error updating product:", error);
          const axiosError = error as AxiosError<{ error?: string }>;
          return {
            ok: false as const,
            error:
              axiosError.response?.data?.error ?? "Failed to update product",
          };
        }
      },
      fetchOrders: async () => {
        try {
          set({ isLoading: true, error: null });
          const res = await api.get<
            { success: true; orders: Order[] } | { error: string }
          >("/api/admin/orders");
          const data = res.data;
          if ("success" in data && data.success === true && "orders" in data) {
            const orders = data.orders;
            const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
            set({
              recentOrders: orders,
              totalOrders: orders.length,
              totalRevenue,
              isLoading: false,
              error: null,
            });
          } else {
            set({ error: "Failed to fetch orders", isLoading: false });
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
          const axiosError = error as AxiosError<{ error?: string }>;
          set({
            error:
              axiosError.response?.data?.error ?? "Failed to fetch orders",
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
