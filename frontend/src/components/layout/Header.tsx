import { Search, Heart, ShoppingCart, User, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useUser } from "@clerk/react";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useUIStore } from "@/stores/uiStore";
import { useProductStore } from "@/stores/productStore";
import { useState, useEffect, useRef } from "react";

const Header = () => {
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.totalItems);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { searchQuery, setSearchQuery } = useUIStore();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const { isSignedIn, user } = useUser();
  const currentUser = useAuthStore((s) => s.currentUser);
  const isAdmin = currentUser?.role === "ADMIN";
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [storeName, setStoreName] = useState<string | null>(null);

  const { searchResults, isSearching, fetchSearchResults, clearSearchResults } =
    useProductStore();

  const showDropdown =
    localSearch.trim().length > 0 && (isSearching || searchResults.length > 0);

  // Fetch public store settings once on mount
  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.storeName) setStoreName(data.storeName);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!localSearch.trim()) {
      clearSearchResults();
      return;
    }
    const timer = setTimeout(() => {
      fetchSearchResults(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setLocalSearch("");
        clearSearchResults();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localSearch.trim()) return;
    const q = localSearch;
    setSearchQuery(q);
    setLocalSearch("");
    clearSearchResults();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleResultClick = (slug: string) => {
    setLocalSearch("");
    clearSearchResults();
    navigate(`/products/${slug}`);
  };

  const handleClear = () => {
    setLocalSearch("");
    clearSearchResults();
  };

  return (
    <header
      className="w-full py-3 px-4 lg:px-8"
      style={{ backgroundColor: "hsl(0, 0%, 18%)" }}
    >
      <div className="max-w-[1320px] mx-auto flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-orange-600 bg-clip-text text-transparent">
            {storeName ?? (
              <>
                Tech<span className="text-orange-600">Zone</span>
                <span className="text-2xl font-normal">50</span>
              </>
            )}
          </span>
        </Link>

        {/* Search Bar */}
        <div ref={wrapperRef} className="flex-1 max-w-[600px] relative">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Kërko produkte"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full h-10 pl-4 pr-20 rounded-lg bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-10 top-0 h-10 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-primary"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-12 left-0 right-0 bg-white rounded-lg shadow-xl border border-border z-50 overflow-hidden">
              {isSearching ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  Duke kërkuar...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  Nuk u gjet asnjë produkt.
                </div>
              ) : (
                <>
                  <ul className="max-h-80 overflow-y-auto divide-y divide-border">
                    {searchResults.slice(0, 6).map((product) => (
                      <li key={product.id}>
                        <button
                          type="button"
                          onClick={() => handleResultClick(product.slug)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 object-contain rounded flex-shrink-0 bg-muted"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {product.category}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-primary flex-shrink-0">
                            €{product.price.toFixed(2)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {searchResults.length > 6 && (
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="w-full px-4 py-2.5 text-sm text-center text-primary font-medium hover:bg-muted border-t border-border transition-colors"
                    >
                      Shiko të gjitha {searchResults.length} rezultatet
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/wishlist"
            className="relative text-white hover:text-primary transition-colors"
          >
            <Heart className="h-6 w-6" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            className="relative text-white hover:text-primary transition-colors"
          >
            <ShoppingCart className="h-6 w-6" />
            {totalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {totalItems()}
              </span>
            )}
          </Link>

          {isSignedIn ? (
            <Link
              to={isAdmin ? "/admin" : "/account"}
              className="flex items-center gap-2 text-white hover:text-primary transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="text-sm hidden lg:inline">
                {user?.fullName ?? user?.firstName ?? "Llogari"}
              </span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 text-white hover:text-primary transition-colors border border-white/30 rounded-lg px-4 py-2"
            >
              <User className="h-5 w-5" />
              <span className="text-sm">Kyçu</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
