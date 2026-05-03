import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { SignIn, SignUp, useAuth, useUser } from "@clerk/react";
import { useAuthStore } from "@/stores/authStore";

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isSignedIn, user, isLoaded: userLoaded } = useUser();
  const { isLoaded: authLoaded, userId } = useAuth();
  const clerkReady = authLoaded && userLoaded;
  const currentUser = useAuthStore((s) => s.currentUser);
  const authError = useAuthStore((s) => s.error);
  const isRegister = searchParams.get("mode") === "register";

  useEffect(() => {
    if (!clerkReady) return;
    if (!isSignedIn || !userId) return;
    if (authError) {
      navigate("/");
      return;
    }
    if (!currentUser) return;
    navigate(currentUser.role === "ADMIN" ? "/admin" : "/");
  }, [clerkReady, isSignedIn, userId, currentUser, authError, navigate]);

  const showAuthForms = clerkReady && !isSignedIn;

  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl border border-border p-8">
          <h1 className="text-2xl font-bold text-center mb-6">
            {isRegister ? "Regjistrohu" : "Kyçu"}
          </h1>

          <div className="mt-6">
            {!clerkReady ? (
              <p className="text-center text-sm text-muted-foreground">
                Duke ngarkuar…
              </p>
            ) : isSignedIn && userId ? (
              <p className="text-center text-sm text-muted-foreground">
                {authError
                  ? "Duke ju ridrejtuar…"
                  : !currentUser
                    ? "Duke sinkronizuar llogarinë…"
                    : "Duke ju ridrejtuar…"}
              </p>
            ) : isRegister ? (
              <SignUp
                routing="path"
                path="/login"
                signInUrl="/login"
                signUpFallbackRedirectUrl="/"
              />
            ) : (
              <SignIn
                routing="path"
                path="/login"
                signUpUrl="/login?mode=register"
                signInFallbackRedirectUrl="/"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
