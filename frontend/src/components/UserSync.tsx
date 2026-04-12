import { useEffect } from "react";
import { useUser } from "@clerk/react";

const UserSync = ({ children }: { children: React.ReactNode }) => {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      const syncUser = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/users/sync`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                clerkId: user.id,
                email:
                  user.primaryEmailAddress?.emailAddress ||
                  user.emailAddresses?.[0]?.emailAddress,
                name: user.fullName || user.firstName,
              }),
            },
          );
          if (response.ok) {
            console.log("User synced to database ✓");
          }
        } catch (error) {
          console.error("Failed to sync user:", error);
        }
      };
      syncUser();
    }
  }, [user, isSignedIn]);

  return <>{children}</>;
};

export default UserSync;
