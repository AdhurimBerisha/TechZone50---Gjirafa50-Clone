import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AxiosError } from "axios";
import { api } from "@/lib/api";

export type UserRole = "CUSTOMER" | "ADMIN" | "VENDOR";

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  clerkId?: string | null;
  email: string;
  name?: string | null;
  phone?: string | null;
  bio?: string | null;
  avatar?: string | null;
  role: UserRole;

  addresses?: Address[];
}

type UpdateUserPayload = Partial<
  Pick<User, "name" | "phone" | "bio" | "avatar">
>;

interface AuthState {
  currentUser: User | null;
  isHydrating: boolean;
  error: string | null;

  setCurrentUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  syncUser: (
    token: string,
    data: {
      email: string;
      name?: string | null;
      avatar?: string | null;
    },
  ) => Promise<void>;

  fetchCurrentUser: (token: string) => Promise<void>;

  updateUser: (token: string, data: UpdateUserPayload) => Promise<void>;

  uploadAvatar: (token: string, file: File) => Promise<void>;

  // ---------------- ADDRESS ACTIONS ----------------
  fetchAddresses: (token: string) => Promise<void>;

  addAddress: (
    token: string,
    data: Omit<Address, "id" | "userId">,
  ) => Promise<void>;

  updateAddress: (
    token: string,
    id: string,
    data: Partial<Address>,
  ) => Promise<void>;

  deleteAddress: (token: string, id: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isHydrating: false,
      error: null,

      setCurrentUser: (user) => set({ currentUser: user }),
      setError: (error) => set({ error }),

      reset: () =>
        set({
          currentUser: null,
          isHydrating: false,
          error: null,
        }),

      // ---------------- SYNC USER ----------------
      syncUser: async (token, data) => {
        try {
          set({ error: null });

          const res = await api.post<{ success: true; user: User }>(
            "/api/users/sync",
            data,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          set({ currentUser: res.data.user });
        } catch (error) {
          const axiosError = error as AxiosError<{ error?: string }>;

          set({
            error: axiosError.response?.data?.error ?? "Failed to sync user",
          });

          throw error;
        }
      },

      // ---------------- FETCH USER ----------------
      fetchCurrentUser: async (token) => {
        try {
          set({ error: null });

          const res = await api.get<{ success: true; user: User }>(
            "/api/users/me",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          set({ currentUser: res.data.user });
        } catch (error) {
          const axiosError = error as AxiosError<{ error?: string }>;

          set({
            error:
              axiosError.response?.data?.error ??
              "Failed to fetch current user",
          });

          throw error;
        }
      },

      // ---------------- UPDATE USER ----------------
      updateUser: async (token, data) => {
        try {
          set({ error: null });

          const res = await api.put<{ success: true; user: User }>(
            "/api/users/profile",
            data,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          set({ currentUser: res.data.user });
        } catch (error) {
          const axiosError = error as AxiosError<{ error?: string }>;

          set({
            error: axiosError.response?.data?.error ?? "Failed to update user",
          });

          throw error;
        }
      },

      // ---------------- UPLOAD AVATAR ----------------
      uploadAvatar: async (token, file) => {
        try {
          set({ error: null });

          const formData = new FormData();
          formData.append("avatar", file);

          const res = await api.post<{ success: true; user: User }>(
            "/api/users/upload-avatar",
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            },
          );

          set({ currentUser: res.data.user });
        } catch (error) {
          const axiosError = error as AxiosError<{ error?: string }>;

          set({
            error: axiosError.response?.data?.error ?? "Upload failed",
          });

          throw error;
        }
      },

      // ======================================================
      // =============== ADDRESS MANAGEMENT ===================
      // ======================================================

      fetchAddresses: async (token) => {
        try {
          const res = await api.get<{ success: true; addresses: Address[] }>(
            "/api/users/addresses",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          set((state) => ({
            currentUser: state.currentUser
              ? { ...state.currentUser, addresses: res.data.addresses }
              : state.currentUser,
          }));
        } catch (error) {
          console.error("fetchAddresses error", error);
          throw error;
        }
      },

      addAddress: async (token, data) => {
        try {
          const res = await api.post<{ success: true; address: Address }>(
            "/api/users/addresses",
            data,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          set((state) => ({
            currentUser: state.currentUser
              ? {
                  ...state.currentUser,
                  addresses: [
                    ...(state.currentUser.addresses || []),
                    res.data.address,
                  ],
                }
              : state.currentUser,
          }));
        } catch (error) {
          console.error("addAddress error", error);
          throw error;
        }
      },

      updateAddress: async (token, id, data) => {
        try {
          const res = await api.put<{ success: true; address: Address }>(
            `/api/users/addresses/${id}`,
            data,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          set((state) => ({
            currentUser: state.currentUser
              ? {
                  ...state.currentUser,
                  addresses: (state.currentUser.addresses || []).map((a) =>
                    a.id === id ? res.data.address : a,
                  ),
                }
              : state.currentUser,
          }));
        } catch (error) {
          console.error("updateAddress error", error);
          throw error;
        }
      },

      deleteAddress: async (token, id) => {
        try {
          await api.delete(`/api/users/addresses/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          set((state) => ({
            currentUser: state.currentUser
              ? {
                  ...state.currentUser,
                  addresses: (state.currentUser.addresses || []).filter(
                    (a) => a.id !== id,
                  ),
                }
              : state.currentUser,
          }));
        } catch (error) {
          console.error("deleteAddress error", error);
          throw error;
        }
      },
    }),
    {
      name: "techstore50-auth",
      partialize: (state) => ({
        currentUser: state.currentUser,
      }),
    },
  ),
);
