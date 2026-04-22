import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AxiosError } from "axios";
import type { Product } from "@/data/products";
import { api } from "@/lib/api";

export interface CartItem {
  product: Product;
  quantity: number;
}

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

type ApiCartRow = {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product: ApiProduct;
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

function toCartError(e: unknown): Error {
  const ax = e as AxiosError<{ error?: string }>;
  if (ax.response?.data?.error) {
    return new Error(ax.response.data.error);
  }
  if (e instanceof Error) {
    return e;
  }
  return new Error("Gabim në shportë");
}

type FetchCartResponse =
  | { success: true; items: ApiCartRow[] }
  | { success?: false; error?: string };

type CartItemResponse =
  | { success: true; cartItem: ApiCartRow }
  | { success?: false; error?: string };

type OkResponse = { success: true; clearedAll?: boolean } | { success?: false; error?: string };

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  fetchCartFromServer: (token: string) => Promise<void>;
  addToCartServer: (token: string, productId: string, quantity: number) => Promise<void>;
  updateCartItemServer: (
    token: string,
    productId: string,
    quantity: number,
  ) => Promise<void>;
  removeCartLineServer: (token: string, productId: string) => Promise<void>;
  clearCartServer: (token: string) => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product, quantity = 1) => {
        const q = Math.max(0, Math.floor(quantity));
        if (q === 0) return;
        set((state) => {
          const existing = state.items.find(
            (i) => i.product.id === product.id,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + q }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { product, quantity: q }] };
        });
      },

      addItem: (product) => {
        get().addToCart(product, 1);
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.product.id !== productId)
              : state.items.map((i) =>
                  i.product.id === productId ? { ...i, quantity } : i,
                ),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0,
        ),

      fetchCartFromServer: async (token) => {
        try {
          const res = await api.get<FetchCartResponse>("/api/users/cart", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if ("success" in res.data && res.data.success === true) {
            set({
              items: res.data.items.map((row) => ({
                product: mapApiProductToUi(row.product),
                quantity: row.quantity,
              })),
            });
            return;
          }
          throw new Error(
            "error" in res.data && res.data.error
              ? res.data.error
              : "Nuk u ngarkua shporta",
          );
        } catch (e) {
          throw toCartError(e);
        }
      },

      addToCartServer: async (token, productId, quantity) => {
        try {
          const res = await api.post<CartItemResponse>(
            "/api/users/cart",
            { productId, quantity },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if ("success" in res.data && res.data.success === true) {
            const row = res.data.cartItem;
            const ui = mapApiProductToUi(row.product);
            set((state) => {
              const rest = state.items.filter((i) => i.product.id !== ui.id);
              return {
                items: [...rest, { product: ui, quantity: row.quantity }],
              };
            });
            return;
          }
          throw new Error(
            "error" in res.data && res.data.error
              ? res.data.error
              : "Nuk u shtua në shportë",
          );
        } catch (e) {
          throw toCartError(e);
        }
      },

      updateCartItemServer: async (token, productId, quantity) => {
        try {
          const res = await api.patch<CartItemResponse | OkResponse>(
            "/api/users/cart",
            { productId, quantity },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if ("success" in res.data && res.data.success === true) {
            if ("cartItem" in res.data && res.data.cartItem) {
              const row = res.data.cartItem;
              const ui = mapApiProductToUi(row.product);
              set((state) => {
                const rest = state.items.filter((i) => i.product.id !== ui.id);
                return {
                  items: [...rest, { product: ui, quantity: row.quantity }],
                };
              });
            } else {
              set((state) => ({
                items: state.items.filter((i) => i.product.id !== productId),
              }));
            }
            return;
          }
          throw new Error(
            "error" in res.data && res.data.error
              ? res.data.error
              : "Nuk u përditësua shporta",
          );
        } catch (e) {
          throw toCartError(e);
        }
      },

      removeCartLineServer: async (token, productId) => {
        try {
          const res = await api.delete<OkResponse>("/api/users/cart", {
            headers: { Authorization: `Bearer ${token}` },
            data: { productId },
          });
          if ("success" in res.data && res.data.success === true) {
            get().removeItem(productId);
            return;
          }
          throw new Error(
            "error" in res.data && res.data.error
              ? res.data.error
              : "Nuk u hoq nga shporta",
          );
        } catch (e) {
          throw toCartError(e);
        }
      },

      clearCartServer: async (token) => {
        try {
          const res = await api.delete<OkResponse>("/api/users/cart/clear", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if ("success" in res.data && res.data.success === true) {
            set({ items: [] });
            return;
          }
          throw new Error(
            "error" in res.data && res.data.error
              ? res.data.error
              : "Nuk u pastrua shporta",
          );
        } catch (e) {
          throw toCartError(e);
        }
      },
    }),
    { name: "techstore50-cart" },
  ),
);
