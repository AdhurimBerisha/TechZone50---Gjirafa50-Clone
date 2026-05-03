import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/react";
import { AxiosError } from "axios";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { useWishlistStore } from "../stores/wishlistStore";
import { useCartStore } from "../stores/cartStore";

const UserSync = ({ children }: { children: React.ReactNode }) => {
  const { user, isSignedIn, isLoaded: userLoaded } = useUser();
  const { getToken, isLoaded: authLoaded, userId } = useAuth();
  const setCurrentUser = useAuthStore((s) => s.setCurrentUser);
  const setError = useAuthStore((s) => s.setError);

  const clerkReady = authLoaded && userLoaded;
  const primaryEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "";
  const syncDisplayName = user?.fullName || user?.firstName || "";

  useEffect(() => {
    // getToken is intentionally read from the latest Clerk closure without listing it in deps
    // (see comment at end of effect).
    if (!clerkReady) return;

    if (!isSignedIn) {
      setCurrentUser(null);
      setError(null);
      return;
    }

    if (!userId || !primaryEmail) return;

    let cancelled = false;

    const run = async () => {
      try {
        setError(null);
        const token = await getToken();
        if (!token || cancelled) return;

        await api.post<{ success: true; user: unknown }>(
          "/api/users/sync",
          {
            email: primaryEmail,
            name: syncDisplayName || undefined,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (cancelled) return;

        const me = await api.get<{ success: true; user: any }>("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (cancelled) return;

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
        if (cancelled) return;
        console.error("Failed to sync user:", error);
        const axiosError = error as AxiosError<{ error?: string }>;
        setError(axiosError.response?.data?.error ?? "Failed to sync user");
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
    // Intentionally omit getToken: Clerk often gives a new function reference each
    // render, which would retrigger this effect endlessly and cancel sync before
    // setCurrentUser runs (breaking /admin and post-login redirect).
  }, [
    clerkReady,
    isSignedIn,
    userId,
    primaryEmail,
    syncDisplayName,
    setCurrentUser,
    setError,
  ]);

  return <>{children}</>;
};

export default UserSync;
