import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/react";
import { AxiosError } from "axios";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { useWishlistStore } from "../stores/wishlistStore";
import { useCartStore } from "../stores/cartStore";

const UserSync = ({ children }: { children: React.ReactNode }) => {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const setCurrentUser = useAuthStore((s) => s.setCurrentUser);
  const setError = useAuthStore((s) => s.setError);

  useEffect(() => {
    if (isSignedIn && user) {
      const syncUser = async () => {
        try {
          setError(null);
          const token = await getToken();
          if (!token) return;

          await api.post<{ success: true; user: unknown }>(
            "/api/users/sync",
            {
              email:
                user.primaryEmailAddress?.emailAddress ||
                user.emailAddresses?.[0]?.emailAddress,
              name: user.fullName || user.firstName,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const me = await api.get<{ success: true; user: any }>("/api/users/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setCurrentUser(me.data.user);

          try {
            await useWishlistStore.getState().fetchWishlist(token);
          } catch (wishlistErr) {
            console.error("Failed to load wishlist:", wishlistErr);
          }
          try {
            await useCartStore.getState().fetchCartFromServer(token);
          } catch (cartErr) {
            console.error("Failed to load cart:", cartErr);
          }
        } catch (error) {
          console.error("Failed to sync user:", error);
          const axiosError = error as AxiosError<{ error?: string }>;
          setError(axiosError.response?.data?.error ?? "Failed to sync user");
        }
      };
      syncUser();
    }
    if (!isSignedIn) {
      setCurrentUser(null);
    }
  }, [user, isSignedIn, getToken, setCurrentUser, setError]);

  return <>{children}</>;
};

export default UserSync;
