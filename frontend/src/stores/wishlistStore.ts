import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AxiosError } from "axios";
import type { Product } from "@/data/products";
import { api } from "@/lib/api";

type ApiProduct = {
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

function mapApiProductToUi(p: ApiProduct): Product {
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

type WishlistRow = {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product?: ApiProduct | null;
};

type AddWishlistResponse =
  | { success: true; wishListItem: WishlistRow }
  | { success?: false; error?: string };

type RemoveWishlistResponse =
  | { success: true }
  | { success?: false; error?: string };

type FetchWishlistResponse =
  | { success: true; wishlistItems: WishlistRow[] }
  | { success?: false; error?: string };

function toWishlistError(e: unknown): Error {
  const ax = e as AxiosError<{ error?: string }>;
  if (ax.response?.data?.error) {
    return new Error(ax.response.data.error);
  }
  if (e instanceof Error) {
    return e;
  }
  return new Error("Gabim në listën e dëshirave");
}

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
  clearWishlist: () => void;
  fetchWishlist: (token: string) => Promise<void>;
  addToWishList: (token: string, product: Product) => Promise<void>;
  removeFromWishList: (token: string, productId: string) => Promise<void>;
  syncToggleWishlist: (
    product: Product,
    ctx: {
      isSignedIn: boolean | undefined;
      getToken: () => Promise<string | null>;
    },
  ) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) =>
        set((state) => {
          if (state.items.find((i) => i.id === product.id)) return state;
          return { items: [...state.items, product] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== productId),
        })),

      isInWishlist: (productId) => get().items.some((i) => i.id === productId),

      clearWishlist: () => set({ items: [] }),

      toggleItem: (product) => {
        const exists = get().items.find((i) => i.id === product.id);
        if (exists) {
          set((state) => ({
            items: state.items.filter((i) => i.id !== product.id),
          }));
        } else {
          set((state) => ({
            items: [...state.items, product],
          }));
        }
      },

      fetchWishlist: async (token) => {
        try {
          const res = await api.get<FetchWishlistResponse>(
            "/api/users/wishlist",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if ("success" in res.data && res.data.success === true) {
            const next: Product[] = [];
            for (const row of res.data.wishlistItems) {
              if (row.product) {
                next.push(mapApiProductToUi(row.product));
              }
            }
            set({ items: next });
            return;
          }
          const msg =
            "error" in res.data && res.data.error
              ? res.data.error
              : "Nuk u ngarkua lista e dëshirave";
          throw new Error(msg);
        } catch (e) {
          throw toWishlistError(e);
        }
      },

      addToWishList: async (token, product) => {
        try {
          const res = await api.post<AddWishlistResponse>(
            "/api/users/wishlist",
            { productId: product.id },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if ("success" in res.data && res.data.success === true) {
            const w = res.data.wishListItem;
            const ui = w.product ? mapApiProductToUi(w.product) : product;
            get().addItem(ui);
            return;
          }
          const msg =
            "error" in res.data && res.data.error
              ? res.data.error
              : "Nuk u shtua në listën e dëshirave";
          throw new Error(msg);
        } catch (e) {
          throw toWishlistError(e);
        }
      },

      removeFromWishList: async (token, productId) => {
        try {
          const res = await api.delete<RemoveWishlistResponse>(
            "/api/users/wishlist",
            {
              headers: { Authorization: `Bearer ${token}` },
              data: { productId },
            },
          );
          if ("success" in res.data && res.data.success === true) {
            get().removeItem(productId);
            return;
          }
          const msg =
            "error" in res.data && res.data.error
              ? res.data.error
              : "Nuk u hoq nga lista e dëshirave";
          throw new Error(msg);
        } catch (e) {
          throw toWishlistError(e);
        }
      },

      syncToggleWishlist: async (product, ctx) => {
        if (ctx.isSignedIn !== true) {
          get().toggleItem(product);
          return;
        }
        const token = await ctx.getToken();
        if (!token) {
          throw new Error("Sesioni skadoi. Hyni përsëri.");
        }
        if (get().isInWishlist(product.id)) {
          await get().removeFromWishList(token, product.id);
        } else {
          await get().addToWishList(token, product);
        }
      },
    }),
    { name: "techstore50-wishlist" },
  ),
);
