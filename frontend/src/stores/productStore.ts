import { create } from "zustand";
import { AxiosError } from "axios";
import { api } from "@/lib/api";
import type { Product as UiProduct } from "@/data/products";

type BackendProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category: string;
  categorySlug: string;
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

function toUiProduct(p: BackendProduct): UiProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    oldPrice: p.oldPrice ?? undefined,
    image: p.image ?? p.images?.[0] ?? "",
    category: p.category,
    categorySlug: p.categorySlug,
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
  isLoading: boolean;
  error: string | null;

  fetchAllProducts: () => Promise<void>;
  reset: () => void;
}

export const useProductStore = create<ProductState>()((set) => ({
  products: [],
  isLoading: false,
  error: null,

  reset: () => set({ products: [], isLoading: false, error: null }),

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
        isLoading: false,
        error: ("error" in res.data && res.data.error) || "Failed to fetch products",
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      const axiosError = error as AxiosError<{ error?: string }>;
      set({
        products: [],
        isLoading: false,
        error: axiosError.response?.data?.error ?? "Failed to fetch products",
      });
    }
  },
}));

