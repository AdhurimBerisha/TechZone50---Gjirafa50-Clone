import { useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "@clerk/react";
import { useWishlistStore } from "@/stores/wishlistStore";
import ProductCard from "@/components/ProductCard";
import { Heart } from "lucide-react";

const WishlistPage = () => {
  const { items } = useWishlistStore();
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const { isSignedIn, getToken, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded || isSignedIn !== true) return;
    void (async () => {
      try {
        const token = await getToken();
        if (token) {
          await fetchWishlist(token);
        }
      } catch {
        /* errors surfaced when toggling wishlist */
      }
    })();
  }, [isLoaded, isSignedIn, getToken, fetchWishlist]);

  if (items.length === 0) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-16 text-center">
        <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-2">
          Lista e dëshirave është bosh
        </h1>
        <p className="text-muted-foreground mb-6">
          Shto produkte në listën e dëshirave
        </p>
        <Link
          to="/"
          className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Vazhdo blerjen
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-6">
      <h1 className="text-2xl font-semibold mb-6">
        Lista e dëshirave ({items.length})
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
