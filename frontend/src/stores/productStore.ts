import { create } from "zustand";
import { AxiosError } from "axios";
import { api } from "@/lib/api";
import type { Product as UiProduct } from "@/data/products";

export type BackendProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category: string;
  categorySlug: string;
  subcategorySlugs?: string[] | null;
  price: number;
  oldPrice?: number | null;
  rating: number;
  image?: string | null;
  images: string[];
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export function toUiProduct(p: BackendProduct): UiProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    oldPrice: p.oldPrice ?? undefined,
    image: p.image ?? p.images?.[0] ?? "",
    category: p.category,
    categorySlug: p.categorySlug,
    subcategorySlugs: p.subcategorySlugs ?? undefined,
    brand: "—",
    rating: p.rating ?? 0,
    reviewCount: 0,
    badges: [],
    specs: {},
    description: p.description ?? "",
    inStock: p.stock > 0,
  };
}

type GetAllProductsResponse =
  | { success: true; products: BackendProduct[] }
  | { success?: false; error?: string };

interface ProductState {
  products: UiProduct[];
  currentProduct: UiProduct | null;
  isLoading: boolean;
  error: string | null;

  fetchAllProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  getProductById: (id: string) => UiProduct | undefined;
  reset: () => void;
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,

  reset: () =>
    set({ products: [], currentProduct: null, isLoading: false, error: null }),

  getProductById: (id) => get().products.find((p) => p.id === id),

  fetchAllProducts: async () => {
    try {
      set({ isLoading: true, error: null });

      const res = await api.get<GetAllProductsResponse>("/api/products");
      if ("success" in res.data && res.data.success === true) {
        set({ products: res.data.products.map(toUiProduct), isLoading: false });
        return;
      }

      set({
        products: [],
        currentProduct: null,
        isLoading: false,
        error: ("error" in res.data && res.data.error) || "Failed to fetch products",
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      const axiosError = error as AxiosError<{ error?: string }>;
      set({
        products: [],
        currentProduct: null,
        isLoading: false,
        error: axiosError.response?.data?.error ?? "Failed to fetch products",
      });
    }
  },

  fetchProductById: async (id: string) => {
    try {
      set({ error: null });

      const cached = get().products.find((p) => p.id === id);
      if (cached) {
        set({ currentProduct: cached });
        return;
      }

      set({ isLoading: true });
      const res = await api.get<
        | { success: true; product: BackendProduct }
        | { success?: false; error?: string }
      >(`/api/products/id/${encodeURIComponent(id)}`);

      if ("success" in res.data && res.data.success === true) {
        const ui = toUiProduct(res.data.product);
        set((state) => ({
          currentProduct: ui,
          isLoading: false,
          products: state.products.some((p) => p.id === ui.id)
            ? state.products
            : [...state.products, ui],
        }));
        return;
      }

      set({
        currentProduct: null,
        isLoading: false,
        error:
          ("error" in res.data && res.data.error) || "Failed to fetch product",
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      const axiosError = error as AxiosError<{ error?: string }>;
      set({
        currentProduct: null,
        isLoading: false,
        error: axiosError.response?.data?.error ?? "Failed to fetch product",
      });
    }
  },
}));

