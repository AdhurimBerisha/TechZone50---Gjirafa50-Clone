import { create } from "zustand";
import { AxiosError } from "axios";
import { api } from "@/lib/api";
import type { Category, MegaMenu } from "@/data/products";
import { staticCategories } from "@/data/products";
import { normalizeSubcategoryList } from "@/lib/categoryShape";

type ApiCategory = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  sortOrder: number;
  subcategories?: unknown;
  megaMenu?: MegaMenu | null;
};

function toCategory(row: ApiCategory): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon,
    subcategories: normalizeSubcategoryList(row.subcategories),
    megaMenu: row.megaMenu ?? undefined,
  };
}

type GetCategoriesResponse =
  | { success: true; categories: ApiCategory[] }
  | { success?: false; error?: string };

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: staticCategories,
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });

      const res = await api.get<GetCategoriesResponse>("/api/categories");

      if ("success" in res.data && res.data.success === true) {
        set({
          categories: res.data.categories.map(toCategory),
          isLoading: false,
        });
        return;
      }

      set({
        isLoading: false,
        error:
          ("error" in res.data && res.data.error) || "Failed to fetch categories",
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      const axiosError = error as AxiosError<{ error?: string }>;
      set({
        categories: staticCategories,
        isLoading: false,
        error:
          axiosError.response?.data?.error ?? "Failed to fetch categories",
      });
    }
  },
}));
