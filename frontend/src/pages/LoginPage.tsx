import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { SignIn, SignUp, useUser } from "@clerk/react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isSignedIn, user } = useUser();
  const isRegister = searchParams.get("mode") === "register";

  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = email?.endsWith("@techzone50.com") ?? false;

  useEffect(() => {
    if (isSignedIn && user) {
      navigate(isAdmin ? "/admin" : "/");
    }
  }, [isSignedIn, user, isAdmin, navigate]);

  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl border border-border p-8">
          <h1 className="text-2xl font-bold text-center mb-6">
            {isRegister ? "Regjistrohu" : "Kyçu"}
          </h1>

          <div className="mt-6">
            {isRegister ? (
              <SignUp
                routing="path"
                path="/login"
                signInUrl="/login"
                forceRedirectUrl="/login"
              />
            ) : (
              <SignIn
                routing="path"
                path="/login"
                signUpUrl="/login?mode=register"
                forceRedirectUrl="/login"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
