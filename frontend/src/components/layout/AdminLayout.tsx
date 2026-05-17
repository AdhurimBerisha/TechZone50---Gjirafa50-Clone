import { useEffect, useState } from "react";
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
  Menu,
} from "lucide-react";
import CategorySync from "@/components/CategorySync";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const adminNav = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Produktet", path: "/admin/products", icon: Package },
  { label: "Porositë", path: "/admin/orders", icon: ShoppingCart },
  { label: "Përdoruesit", path: "/admin/users", icon: Users },
  { label: "Gift Cards", path: "/admin/gift-cards", icon: Gift },
  { label: "Cilësimet", path: "/admin/settings", icon: Settings },
];

function AdminSidebarNav({
  pathname,
  onNavigate,
  onLogout,
}: {
  pathname: string;
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="p-4 sm:p-5 border-b border-white/10 shrink-0">
        <Link
          to="/admin"
          className="text-lg sm:text-xl font-bold"
          onClick={onNavigate}
        >
          Tech<span className="text-orange-600">Zone</span>
          <span className="text-orange-600 text-base sm:text-lg font-normal">
            50
          </span>
        </Link>
        <p className="text-xs text-white/50 mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 p-2 sm:p-3 space-y-1 overflow-y-auto min-h-0">
        {adminNav.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-orange-600 text-primary-foreground"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 sm:p-3 border-t border-white/10 shrink-0">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" /> Kthehu në dyqan
        </Link>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            onLogout();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-red-400 hover:bg-white/10 w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" /> Dil
        </button>
      </div>
    </>
  );
}

const AdminLayout = () => {
  const { signOut, isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const currentUser = useAuthStore((s) => s.currentUser);
  const authError = useAuthStore((s) => s.error);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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

  const pageTitle =
    adminNav.find((n) => n.path === location.pathname)?.label || "Admin";

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-muted">
      <CategorySync />

      <aside className="hidden lg:flex w-[260px] bg-[hsl(0,0%,18%)] text-white flex-col flex-shrink-0 min-h-screen sticky top-0">
        <AdminSidebarNav
          pathname={location.pathname}
          onLogout={() => void handleLogout()}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-border px-3 sm:px-4 md:px-6 py-3 flex items-center gap-3 justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-muted text-foreground shrink-0"
              aria-label="Hap menunë e adminit"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base sm:text-lg font-semibold truncate">
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <span className="truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
              {user.fullName ?? email}
            </span>
          </div>
        </header>
        <main className="flex-1 p-3 sm:p-4 md:p-6 min-w-0">
          <Outlet />
        </main>
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="w-[min(100vw-2rem,280px)] p-0 gap-0 bg-[hsl(0,0%,18%)] text-white border-0 flex flex-col"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Admin menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col flex-1 min-h-0 pt-10">
            <AdminSidebarNav
              pathname={location.pathname}
              onNavigate={closeSidebar}
              onLogout={() => void handleLogout()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminLayout;
