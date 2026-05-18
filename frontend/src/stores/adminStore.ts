import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AxiosError } from "axios";
import { api } from "@/lib/api";
import {
  normalizeBackendProduct,
  type BackendProduct,
  type BackendProductInput,
} from "@/stores/productStore";
import { categoryDisplayName, type ApiCategory } from "@/lib/productCategory";
import {
  buildCreateProductFormData,
  compactUpdatePayload,
  extractAdminApiError,
  type CreateProductPayload,
  type ProductSpecificationInput,
  type ProductVariantInput,
  type ProductVariantOptionInput,
  type UpdateProductPayload,
} from "@/lib/adminProductPayload";

export type {
  CreateProductPayload,
  UpdateProductPayload,
  ProductSpecificationInput,
  ProductVariantInput,
  ProductVariantOptionInput,
};

const adminAuth = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const adminAuthMultipart = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

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

interface AdminActions {
  fetchAllProducts: (token: string) => Promise<void>;
  fetchAllUsers: (token: string) => Promise<void>;
  fetchOrders: (token: string) => Promise<void>;
  fetchDashboardStats: (token: string) => Promise<void>;
  fetchTopSellingProducts: (token: string) => Promise<void>;
  fetchTotalRevenue: (token: string) => Promise<void>;
  updateOrderStatus: (
    token: string,
    id: string,
    status: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  createProduct: (
    token: string,
    payload: CreateProductPayload,
    imageFile?: File | null,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  updateProduct: (
    token: string,
    id: string,
    payload: UpdateProductPayload,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  createGiftCard: (
    token: string,
    amount: number,
  ) => Promise<
    { ok: true; code: string; amount: number } | { ok: false; error: string }
  >;
  createAdminSettings: (
    token: string,
    settings: Partial<AdminSettings>,
  ) => Promise<
    { ok: true; settings: AdminSettings } | { ok: false; error: string }
  >;
  updateAdminSettings: (
    token: string,
    settings: Partial<AdminSettings>,
  ) => Promise<
    { ok: true; settings: AdminSettings } | { ok: false; error: string }
  >;
  fetchAdminSettings: (token: string) => Promise<AdminSettings | null>;
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

interface AdminSettings {
  id: string;
  storeName?: string;
  storeEmail?: string;
  storePhone?: string | null;
  storeDescription?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  shippingPrice?: number;
  freeShippingThreshold?: number | null;
  deliveryTime?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
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
      fetchAllProducts: async (token) => {
        try {
          set({ isLoading: true, error: null });
          const res = await api.get<{
            success: true;
            products: BackendProductInput[];
          }>("/api/admin/products", adminAuth(token));
          if ("success" in res.data && res.data.success === true) {
            const products = res.data.products.map(normalizeBackendProduct);
            set({
              totalProducts: products.length,
              recentProducts: products,
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
      fetchAllUsers: async (token) => {
        try {
          set({ isLoading: true, error: null });
          const res = await api.get<{ success: true; users: User[] }>(
            "/api/admin/users",
            adminAuth(token),
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
      fetchDashboardStats: async (token) => {
        try {
          set({ isLoading: true, error: null });
          const [productsRes, usersRes] = await Promise.all([
            api.get<{ success: true; products: BackendProductInput[] }>(
              "/api/admin/products",
              adminAuth(token),
            ),
            api.get<{ success: true; users: User[] }>(
              "/api/admin/users",
              adminAuth(token),
            ),
          ]);
          const productsOk =
            "success" in productsRes.data && productsRes.data.success === true;
          const usersOk =
            "success" in usersRes.data && usersRes.data.success === true;
          if (!productsOk || !usersOk) {
            set({
              error: "Failed to load dashboard statistics",
              isLoading: false,
            });
            return;
          }
          const products = productsRes.data.products.map(
            normalizeBackendProduct,
          );
          set({
            totalProducts: products.length,
            recentProducts: products,
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
      fetchTopSellingProducts: async (token) => {
        try {
          set({ isLoading: true, error: null });
          const res = await api.get<
            | {
                success: true;
                topProducts: Array<
                  Omit<TopProduct, "category"> & { category: ApiCategory }
                >;
              }
            | { error: string }
          >("/api/admin/top-products", adminAuth(token));
          const data = res.data;
          if (
            "success" in data &&
            data.success === true &&
            "topProducts" in data
          ) {
            set({
              topProducts: data.topProducts.map((p) => ({
                ...p,
                category: categoryDisplayName(p.category),
              })),
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
              axiosError.response?.data?.error ??
              "Failed to fetch top products",
            isLoading: false,
          });
        }
      },
      createProduct: async (token, payload, imageFile) => {
        try {
          const body = buildCreateProductFormData(payload, imageFile);
          const res = await api.post<
            { success: true; product: BackendProductInput } | { error: string }
          >("/api/admin/products", body, adminAuthMultipart(token));
          const data = res.data;
          if ("success" in data && data.success === true && "product" in data) {
            const created = normalizeBackendProduct(data.product);
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
          return {
            ok: false as const,
            error: extractAdminApiError(error, "Failed to create product"),
          };
        }
      },
      updateProduct: async (token, id, payload) => {
        try {
          const res = await api.put<
            { success: true; product: BackendProductInput } | { error: string }
          >(
            `/api/admin/products/${encodeURIComponent(id)}`,
            compactUpdatePayload(payload),
            adminAuth(token),
          );
          const data = res.data;
          if ("success" in data && data.success === true && "product" in data) {
            const updated = normalizeBackendProduct(data.product);
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
          return {
            ok: false as const,
            error: extractAdminApiError(error, "Failed to update product"),
          };
        }
      },
      fetchOrders: async (token) => {
        try {
          set({ isLoading: true, error: null });
          const res = await api.get<
            { success: true; orders: Order[] } | { error: string }
          >("/api/admin/orders", adminAuth(token));
          const data = res.data;
          if ("success" in data && data.success === true && "orders" in data) {
            const orders = data.orders;
            const totalRevenue = orders.reduce(
              (sum, order) => sum + order.total,
              0,
            );
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
            error: axiosError.response?.data?.error ?? "Failed to fetch orders",
            isLoading: false,
          });
        }
      },

      fetchTotalRevenue: async (token) => {
        try {
          set({ isLoading: true, error: null });
          const res = await api.get<
            { success: true; totalRevenue: number } | { error: string }
          >("/api/admin/revenue", adminAuth(token));
          const data = res.data;
          if (
            "success" in data &&
            data.success === true &&
            "totalRevenue" in data
          ) {
            set({
              totalRevenue: data.totalRevenue,
              isLoading: false,
              error: null,
            });
          } else {
            set({ error: "Failed to fetch revenue", isLoading: false });
          }
        } catch (error) {
          console.error("Error fetching revenue:", error);
          const axiosError = error as AxiosError<{ error?: string }>;
          set({
            error:
              axiosError.response?.data?.error ?? "Failed to fetch revenue",
            isLoading: false,
          });
        }
      },
      updateOrderStatus: async (token: string, id: string, status: string) => {
        try {
          set({ isLoading: true, error: null });
          const res = await api.put<
            { success: true; order: Order } | { error: string }
          >(
            `/api/admin/orders/${encodeURIComponent(id)}/status`,
            { status },
            adminAuth(token),
          );
          const data = res.data;
          if ("success" in data && data.success === true && "order" in data) {
            const updated = data.order;
            set((s) => ({
              recentOrders: s.recentOrders.map((o) =>
                o.id === id ? updated : o,
              ),
              isLoading: false,
              error: null,
            }));
            return { ok: true as const };
          }
          const msg =
            "error" in res.data && typeof res.data.error === "string"
              ? res.data.error
              : "Failed to update order status";
          return { ok: false as const, error: msg };
        } catch (error) {
          console.error("Error updating order status:", error);
          const axiosError = error as AxiosError<{ error?: string }>;
          const msg =
            axiosError.response?.data?.error ?? "Failed to update order status";
          set({ error: msg, isLoading: false });
          return { ok: false as const, error: msg };
        }
      },

      createGiftCard: async (token, amount) => {
        try {
          set({ isLoading: true, error: null });
          const res = await api.post<{
            success: true;
            giftCard: { code: string; amount: number };
          }>(`/api/admin/gift-cards`, { amount }, adminAuth(token));
          const data = res.data;
          if (
            "success" in data &&
            data.success === true &&
            "giftCard" in data
          ) {
            set({ isLoading: false, error: null });
            return {
              ok: true as const,
              code: data.giftCard.code,
              amount: data.giftCard.amount,
            };
          }
          const msg =
            "error" in data && typeof data.error === "string"
              ? data.error
              : "Failed to create gift card";
          set({ isLoading: false, error: msg });
          return { ok: false as const, error: msg };
        } catch (error) {
          console.error("Error creating gift card:", error);
          const axiosError = error as AxiosError<{ error?: string }>;
          const msg =
            axiosError.response?.data?.error ?? "Failed to create gift card";
          set({
            error: msg,
            isLoading: false,
          });
          return { ok: false as const, error: msg };
        }
      },
      createAdminSettings: async (token, settings) => {
        try {
          set({ isLoading: true, error: null });
          const res = await api.post<{
            success: true;
            settings: AdminSettings;
          }>(`/api/admin/settings`, settings, adminAuth(token));
          const data = res.data;
          if (
            "success" in data &&
            data.success === true &&
            "settings" in data
          ) {
            set({ isLoading: false, error: null });
            return {
              ok: true as const,
              settings: data.settings,
            };
          }
          const msg =
            "error" in data && typeof data.error === "string"
              ? data.error
              : "Failed to create admin settings";
          set({ isLoading: false, error: msg });
          return { ok: false as const, error: msg };
        } catch (error) {
          console.error("Error creating admin settings:", error);
          const axiosError = error as AxiosError<{ error?: string }>;
          const msg =
            axiosError.response?.data?.error ??
            "Failed to create admin settings";
          set({
            error: msg,
            isLoading: false,
          });
          return { ok: false as const, error: msg };
        }
      },
      updateAdminSettings: async (token, settings) => {
        try {
          set({ isLoading: true, error: null });
          const res = await api.put<{ success: true; settings: AdminSettings }>(
            `/api/admin/settings`,
            settings,
            adminAuth(token),
          );
          const data = res.data;
          if (
            "success" in data &&
            data.success === true &&
            "settings" in data
          ) {
            set({ isLoading: false, error: null });
            return {
              ok: true as const,
              settings: data.settings,
            };
          } else {
            const msg =
              "error" in data && typeof data.error === "string"
                ? data.error
                : "Failed to update admin settings";
            set({ isLoading: false, error: msg });
            return { ok: false as const, error: msg };
          }
        } catch (error) {
          console.error("Error creating admin settings:", error);
          const axiosError = error as AxiosError<{ error?: string }>;
          const msg =
            axiosError.response?.data?.error ??
            "Failed to create admin settings";
          set({
            error: msg,
            isLoading: false,
          });
          return { ok: false as const, error: msg };
        }
      },
      fetchAdminSettings: async (token) => {
        try {
          const res = await api.get<AdminSettings>(
            "/api/admin/settings",
            adminAuth(token),
          );
          return res.data?.id ? res.data : null;
        } catch {
          return null;
        }
      },
    }),
    {
      name: "techstore50-admin",
      partialize: (state) => ({ isLoading: state.isLoading }),
    },
  ),
);
