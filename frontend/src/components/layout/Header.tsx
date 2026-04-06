import { Search, Heart, ShoppingCart, User } from "lucide-react";
import { Link, useNavigate } from "react-router";
// import { useCartStore } from '@/stores/cartStore';
// import { useWishlistStore } from '@/stores/wishlistStore';
// import { useAuthStore } from '@/stores/authStore';
// import { useUIStore } from '@/stores/uiStore';
// import { useState } from "react";

const Header = () => {
  //   const navigate = useNavigate();
  //   const totalItems = useCartStore((s) => s.totalItems);
  //   const wishlistCount = useWishlistStore((s) => s.items.length);
  //   const { user, isAuthenticated } = useAuthStore();
  //   const { searchQuery, setSearchQuery } = useUIStore();
  //   const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // setSearchQuery(localSearch);
    // navigate(`/search?q=${encodeURIComponent(localSearch)}`);
  };

  return (
    <header
      className="w-full py-3 px-4 lg:px-8"
      style={{ backgroundColor: "hsl(0, 0%, 18%)" }}
    >
      <div className="max-w-[1320px] mx-auto flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <span className="text-2xl font-bold text-white">
            Tech<span className="text-primary">Store</span>
            <span className="text-primary text-lg font-normal">50</span>
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-[600px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Kërko produkte"
              //   value={localSearch}
              //   onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-10 pl-4 pr-12 rounded-lg bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-primary"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/wishlist"
            className="relative text-white hover:text-primary transition-colors"
          >
            <Heart className="h-6 w-6" />
            {/* {wishlistCount > 0 && ( */}
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {/* {wishlistCount} */}
            </span>
            {/* )} */}
          </Link>

          <Link
            to="/cart"
            className="relative text-white hover:text-primary transition-colors"
          >
            <ShoppingCart className="h-6 w-6" />
            {/* {totalItems() > 0 && ( */}
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {/* {totalItems()} */}
            </span>
            {/* )} */}
          </Link>

          {/* {isAuthenticated ? ( */}
          {/* <Link
              to={user?.role === 'admin' ? '/admin' : '/account'}
              className="flex items-center gap-2 text-white hover:text-primary transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="text-sm hidden lg:inline">{user?.name}</span>
            </Link> */}
          {/* ) : ( */}
          <Link
            to="/login"
            className="flex items-center gap-2 text-white hover:text-primary transition-colors border border-white/30 rounded-lg px-4 py-2"
          >
            <User className="h-5 w-5" />
            <span className="text-sm">Kyçu</span>
          </Link>
          {/* )} */}
        </div>
      </div>
    </header>
  );
};

export default Header;
