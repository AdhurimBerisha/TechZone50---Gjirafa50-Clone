import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { User, ShieldCheck, Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuthStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "login") {
      const success = login(email, password, role);
      if (success) {
        navigate(role === "admin" ? "/admin" : "/");
      } else {
        setError("Email ose fjalëkalimi i gabuar");
      }
    } else {
      const success = register(email, password, name);
      if (success) {
        navigate("/");
      } else {
        setError("Ju lutem plotësoni të gjitha fushat");
      }
    }
  };

  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl border border-border p-8">
          <h1 className="text-2xl font-bold text-center mb-6">
            {mode === "login" ? "Kyçu" : "Regjistrohu"}
          </h1>

          {/* Role Toggle */}
          {mode === "login" && (
            <div className="flex rounded-lg border border-border overflow-hidden mb-6">
              <button
                onClick={() => setRole("user")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="h-4 w-4" />
                Përdorues
              </button>
              <button
                onClick={() => setRole("admin")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  role === "admin"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </button>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium mb-1">Emri</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Emri juaj"
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === "admin"
                    ? "admin@techstore50.com"
                    : "email@shembull.com"
                }
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Fjalëkalimi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              {mode === "login" ? "Kyçu" : "Regjistrohu"}
            </button>
          </form>

          {/* Demo credentials hint */}
          {mode === "login" && (
            <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
              <p className="font-medium mb-1">Demo kredencialet:</p>
              {role === "admin" ? (
                <p>admin@techstore50.com / admin123</p>
              ) : (
                <p>user@techstore50.com / user123</p>
              )}
            </div>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <p>
                Nuk keni llogari?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-primary hover:underline font-medium"
                >
                  Regjistrohu
                </button>
              </p>
            ) : (
              <p>
                Keni llogari?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline font-medium"
                >
                  Kyçu
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
