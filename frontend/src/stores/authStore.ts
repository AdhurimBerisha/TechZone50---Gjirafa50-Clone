import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AxiosError } from "axios";
import { api } from "@/lib/api";

export type UserRole = "CUSTOMER" | "ADMIN" | "VENDOR";

export interface User {
  id: string;
  clerkId?: string | null;
  email: string;
  name?: string | null;
  phone?: string | null;
  bio?: string | null;
  avatar?: string | null;
  role: UserRole;
}

type UpdateUserPayload = Partial<Pick<User, "name" | "phone" | "bio" | "avatar">>;

interface AuthState {
  currentUser: User | null;
  isHydrating: boolean;
  error: string | null;

  setCurrentUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  updateUser: (token: string, data: UpdateUserPayload) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isHydrating: false,
      error: null,

      setCurrentUser: (user) => set({ currentUser: user }),
      setError: (error) => set({ error }),
      reset: () => set({ currentUser: null, isHydrating: false, error: null }),

      updateUser: async (token, data) => {
        try {
          set({ error: null });
          const res = await api.put<{ success: true; user: User }>(
            "/api/users/profile",
            data,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          set({ currentUser: res.data.user });
        } catch (error) {
          console.error("Error updating user:", error);
          const axiosError = error as AxiosError<{ error?: string }>;
          set({
            error: axiosError.response?.data?.error ?? "Failed to update user",
          });
          throw error;
        }
      },
    }),
    {
      name: "techstore50-auth",
      partialize: (state) => ({ currentUser: state.currentUser }),
    },
  ),
);
