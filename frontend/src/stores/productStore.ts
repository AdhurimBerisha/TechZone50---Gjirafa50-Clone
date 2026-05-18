import { create } from "zustand";
import { AxiosError } from "axios";
import { api } from "@/lib/api";
import type { Product as UiProduct } from "@/data/products";
import {
  categoryFieldsFromApi,
  type ApiCategory,
  type ApiSubcategoryRef,
} from "@/lib/productCategory";

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
  isOutlet: boolean;
  outletDiscount?: number | null;
  outletStock?: number | null;
  condition: "NEW" | "OPEN_BOX" | "REFURBISHED";
  createdAt: string;
  updatedAt: string;
};

/** Raw product row from admin/public APIs (category may be nested). */
export type BackendProductInput = Omit<
  BackendProduct,
  "category" | "categorySlug" | "subcategorySlugs"
> & {
  category?: ApiCategory | string;
  categorySlug?: string;
  subcategory?: ApiSubcategoryRef;
  subcategorySlugs?: string[] | null;
  brand?: string | null;
};

export function normalizeBackendProduct(p: BackendProductInput): BackendProduct {
  const { category, categorySlug, subcategorySlugs } = categoryFieldsFromApi(p);
  return {
    ...p,
    category,
    categorySlug,
    subcategorySlugs: subcategorySlugs ?? null,
  };
}

export function toUiProduct(p: BackendProductInput): UiProduct {
  const normalized = normalizeBackendProduct(p);
  return {
    id: normalized.id,
    name: normalized.name,
    slug: normalized.slug,
    price: normalized.price,
    oldPrice: normalized.oldPrice ?? undefined,
    image: normalized.image ?? normalized.images?.[0] ?? "",
    category: normalized.category,
    categorySlug: normalized.categorySlug,
    subcategorySlugs: normalized.subcategorySlugs ?? undefined,
    brand: p.brand?.trim() || "—",
    rating: normalized.rating ?? 0,
    reviewCount: 0,
    badges: [],
    specs: {},
    description: normalized.description ?? "",
    inStock: normalized.stock > 0,
    isOutlet: normalized.isOutlet,
    outletDiscount: normalized.outletDiscount ?? undefined,
    outletStock: normalized.outletStock ?? undefined,
    condition: normalized.condition,
  };
}

type GetAllProductsResponse =
  | { success: true; products: BackendProduct[] }
  | { success?: false; error?: string };

interface ProductState {
  products: UiProduct[];
  searchResults: UiProduct[];
  currentProduct: UiProduct | null;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;

  fetchAllProducts: (outletOnly?: boolean) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  fetchSearchResults: (query: string) => Promise<void>;
  clearSearchResults: () => void;
  getProductById: (id: string) => UiProduct | undefined;
  reset: () => void;
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  searchResults: [],
  currentProduct: null,
  isSearching: false,
  isLoading: false,
  error: null,

  reset: () =>
    set({ products: [], currentProduct: null, isLoading: false, error: null }),

  getProductById: (id) => get().products.find((p) => p.id === id),

  clearSearchResults: () => set({ searchResults: [] }),

  fetchAllProducts: async (outletOnly = false) => {
    try {
      set({ isLoading: true, error: null });

      const query = outletOnly ? "?outlet=true" : "";
      const res = await api.get<GetAllProductsResponse>(
        `/api/products${query}`,
      );
      if ("success" in res.data && res.data.success === true) {
        set({ products: res.data.products.map(toUiProduct), isLoading: false });
        return;
      }

      set({
        products: [],
        currentProduct: null,
        isLoading: false,
        error:
          ("error" in res.data && res.data.error) || "Failed to fetch products",
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
  fetchSearchResults: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    try {
      set({ isSearching: true, error: null });
      const res = await api.get<GetAllProductsResponse>(
        `/api/products?q=${encodeURIComponent(query)}`,
      );
      if ("success" in res.data && res.data.success === true) {
        set({
          searchResults: res.data.products.map(toUiProduct),
          isSearching: false,
        });
        return;
      }
      set({
        searchResults: [],
        isSearching: false,
        error: ("error" in res.data && res.data.error) || "Search failed",
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      set({
        searchResults: [],
        isSearching: false,
        error: axiosError.response?.data?.error ?? "Search failed",
      });
    }
  },
}));
