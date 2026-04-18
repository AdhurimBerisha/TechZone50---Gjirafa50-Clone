import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "CUSTOMER" | "ADMIN" | "VENDOR";

export interface User {
  id: string;
  clerkId?: string | null;
  email: string;
  name?: string | null;
  role: UserRole;
}

interface AuthState {
  currentUser: User | null;
  isHydrating: boolean;
  error: string | null;

  setCurrentUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
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
    }),
    {
      name: "techstore50-auth",
      partialize: (state) => ({ currentUser: state.currentUser }),
    },
  ),
);
