import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth, useUser } from "@clerk/react";
import { User, Package, Heart, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const AccountPage = () => {
  const navigate = useNavigate();
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const currentUser = useAuthStore((state) => state.currentUser);

  useEffect(() => {
    if (!isSignedIn) {
      navigate("/login");
    }
  }, [isSignedIn, navigate]);

  if (!user) {
    return null;
  }

  const displayName =
    currentUser?.name ?? user.fullName ?? user.firstName ?? "Përdorues";
  const displayEmail =
    currentUser?.email ??
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses?.[0]?.emailAddress ??
    "";

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-6">
      <h1 className="text-2xl font-semibold mb-6">Llogaria ime</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{displayName}</p>
              <p className="text-sm text-muted-foreground">{displayEmail}</p>
              {currentUser?.role && (
                <p className="text-xs text-muted-foreground mt-1">
                  Roli: {currentUser.role}
                </p>
              )}
            </div>
          </div>

          <nav className="space-y-1">
            <Link
              to="/account"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium"
            >
              <User className="h-4 w-4" /> Profili
            </Link>
            <Link
              to="/account"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-muted-foreground"
            >
              <Package className="h-4 w-4" /> Porositë
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-muted-foreground"
            >
              <Heart className="h-4 w-4" /> Lista e dëshirave
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-destructive w-full text-left"
            >
              <LogOut className="h-4 w-4" /> Dil
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h2 className="font-semibold mb-4">Informatat personale</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Emri
                </label>
                <input
                  type="text"
                  value={displayName}
                  readOnly
                  className="w-full border border-border rounded-lg px-4 py-2 text-sm bg-muted/50"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={displayEmail}
                  readOnly
                  className="w-full border border-border rounded-lg px-4 py-2 text-sm bg-muted/50"
                />
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h2 className="font-semibold mb-4">Porositë e fundit</h2>
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Package className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
              Nuk keni asnjë porosi ende.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
