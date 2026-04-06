import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'user' | 'admin') => boolean;
  logout: () => void;
  register: (email: string, password: string, name: string) => boolean;
}

const DEMO_USERS: { email: string; password: string; name: string; role: 'user' | 'admin' }[] = [
  { email: 'admin@techstore50.com', password: 'admin123', name: 'Admin', role: 'admin' },
  { email: 'user@techstore50.com', password: 'user123', name: 'Demo User', role: 'user' },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (email, password, role) => {
        const found = DEMO_USERS.find(
          (u) => u.email === email && u.password === password && u.role === role
        );
        if (found) {
          set({
            user: { id: found.role === 'admin' ? 'admin-1' : 'user-1', email: found.email, name: found.name, role: found.role },
            isAuthenticated: true,
          });
          return true;
        }
        // Allow any credentials for demo
        if (email && password) {
          set({
            user: { id: `${role}-${Date.now()}`, email, name: email.split('@')[0], role },
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      register: (email, password, name) => {
        if (email && password && name) {
          set({
            user: { id: `user-${Date.now()}`, email, name, role: 'user' },
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },
    }),
    { name: 'techstore50-auth' }
  )
);
