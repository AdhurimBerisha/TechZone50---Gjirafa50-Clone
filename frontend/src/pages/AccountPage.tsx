import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { useAuth, useUser } from "@clerk/react";
import {
  User,
  Package,
  Heart,
  LogOut,
  Save,
  Loader2,
  Gift,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useCartStore } from "@/stores/cartStore";
import { ProfileOrders } from "@/components/account/ProfileOrders";
import { ProfileGiftCards } from "@/components/account/ProfileGiftCards";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-full",
    isActive
      ? "bg-primary/10 text-primary font-medium"
      : "text-muted-foreground hover:bg-muted",
  ].join(" ");

const AccountPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isOrdersSection = location.pathname === "/account/orders";
  const isGiftCardsSection = location.pathname === "/account/gift-cards";
  const { isSignedIn, signOut, getToken } = useAuth();
  const { user } = useUser();
  const { currentUser, updateUser, error } = useAuthStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!isSignedIn) {
      navigate("/login");
    }
  }, [isSignedIn, navigate]);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name ?? "");
      setPhone(currentUser.phone ?? "");
      setBio(currentUser.bio ?? "");
    }
  }, [currentUser]);

  if (!user) {
    return null;
  }

  const displayEmail =
    currentUser?.email ??
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses?.[0]?.emailAddress ??
    "";

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMsg("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      await updateUser(token, { name, phone, bio });
      setSuccessMsg("Profili u përditësua me sukses!");
    } finally {
      setIsSaving(false);
    }
  };

  const isDirty =
    name !== (currentUser?.name ?? "") ||
    phone !== (currentUser?.phone ?? "") ||
    bio !== (currentUser?.bio ?? "");

  const handleLogout = async () => {
    await signOut();
    useWishlistStore.getState().clearWishlist();
    useCartStore.getState().clearCart();
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
              <p className="font-medium">{name || "Përdorues"}</p>
              <p className="text-sm text-muted-foreground">{displayEmail}</p>
              {currentUser?.role && (
                <p className="text-xs text-muted-foreground mt-1">
                  Roli: {currentUser.role}
                </p>
              )}
            </div>
          </div>

          <nav className="space-y-1">
            <NavLink to="/account" end className={navLinkClass}>
              <User className="h-4 w-4" /> Profili
            </NavLink>
            <NavLink to="/account/orders" className={navLinkClass}>
              <Package className="h-4 w-4" /> Porositë
            </NavLink>
            <NavLink to="/account/gift-cards" className={navLinkClass}>
              <Gift className="h-4 w-4" /> Gift Cards
            </NavLink>
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
          {isGiftCardsSection ? (
            <ProfileGiftCards />
          ) : isOrdersSection ? (
            <ProfileOrders />
          ) : (
            <div className="bg-white rounded-lg border border-border p-6">
              <h2 className="font-semibold mb-4">Informatat personale</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Emri
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                    className="w-full border border-border rounded-lg px-4 py-2 text-sm bg-muted/50 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Telefoni
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+383 ..."
                    className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-muted-foreground mb-1">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Diçka rreth jush..."
                    className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
              </div>

              {error && (
                <p className="mt-3 text-sm text-destructive">{error}</p>
              )}
              {successMsg && (
                <p className="mt-3 text-sm text-green-600">{successMsg}</p>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !isDirty}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Ruaj ndryshimet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
