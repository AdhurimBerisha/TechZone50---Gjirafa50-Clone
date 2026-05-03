import { useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useAuth, useUser } from "@clerk/react";
import { useAuthStore } from "@/stores/authStore";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Gift,
} from "lucide-react";
import CategorySync from "@/components/CategorySync";

const adminNav = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Produktet", path: "/admin/products", icon: Package },
  { label: "Porositë", path: "/admin/orders", icon: ShoppingCart },
  { label: "Përdoruesit", path: "/admin/users", icon: Users },
  { label: "Gift Cards", path: "/admin/gift-cards", icon: Gift },
  { label: "Cilësimet", path: "/admin/settings", icon: Settings },
];

const AdminLayout = () => {
  const { signOut, isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const currentUser = useAuthStore((s) => s.currentUser);
  const authError = useAuthStore((s) => s.error);
  const location = useLocation();
  const navigate = useNavigate();

  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress;

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      navigate("/login");
      return;
    }
    if (authError) {
      navigate("/");
      return;
    }
    if (currentUser && currentUser.role !== "ADMIN") {
      navigate("/");
    }
  }, [isLoaded, isSignedIn, currentUser, authError, navigate]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Duke ngarkuar…</p>
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return null;
  }

  if (authError) {
    return null;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Duke ngarkuar panelin…</p>
      </div>
    );
  }

  if (currentUser.role !== "ADMIN") {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-muted">
      <CategorySync />
      {/* Sidebar */}
      <aside className="w-[260px] bg-[hsl(0,0%,18%)] text-white flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <Link to="/admin" className="text-xl font-bold">
            Tech<span className="text-orange-600">Zone</span>
            <span className="text-orange-600 text-lg font-normal">50</span>
          </Link>
          <p className="text-xs text-white/50 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {adminNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-orange-600 text-primary-foreground"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" /> Kthehu në dyqan
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-red-400 hover:bg-white/10 w-full"
          >
            <LogOut className="h-4 w-4" /> Dil
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-border px-6 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            {adminNav.find((n) => n.path === location.pathname)?.label ||
              "Admin"}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            {user.fullName ?? email}
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
