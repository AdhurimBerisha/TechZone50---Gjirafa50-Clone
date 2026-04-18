import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/react";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../stores/authStore";

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

          await apiFetch<{ success: true; user: unknown }>("/api/users/sync", {
            method: "POST",
            token,
            body: JSON.stringify({
              email:
                user.primaryEmailAddress?.emailAddress ||
                user.emailAddresses?.[0]?.emailAddress,
              name: user.fullName || user.firstName,
            }),
          });

          const me = await apiFetch<{ success: true; user: any }>("/api/users/me", {
            method: "GET",
            token,
          });

          setCurrentUser(me.user);
        } catch (error) {
          console.error("Failed to sync user:", error);
          setError(error instanceof Error ? error.message : "Failed to sync user");
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
