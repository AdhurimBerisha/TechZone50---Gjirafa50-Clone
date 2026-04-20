import { Link } from "react-router";
import { Heart, ShoppingCart, Star, Truck } from "lucide-react";
import type { Product } from "@/data/products";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

const ProductCard = ({ product }: { product: Product }) => {
  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();
  const wishlisted = isInWishlist(product.id);

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden group hover:shadow-lg transition-shadow relative">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.badges.includes("24h") && (
          <span className="flex items-center gap-1 bg-muted text-xs px-2 py-0.5 rounded font-medium">
            <Truck className="h-3 w-3" /> 24h
          </span>
        )}
        {product.badges.includes("new") && (
          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded font-medium">
            E shitur
          </span>
        )}
      </div>

      {/* Sale badge */}
      {product.oldPrice && (
        <span className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs px-2 py-0.5 rounded font-medium">
          Risi
        </span>
      )}

      {/* Wishlist */}
      <button
        onClick={() => toggleItem(product)}
        className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
        style={{ right: product.oldPrice ? "50px" : "8px" }}
      >
        <Heart
          className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
        />
      </button>

      {/* Image */}
      <Link to={`/product/${product.id}`} className="block p-4">
        <div className="aspect-square flex items-center justify-center overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 pt-0">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem] hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          {product.oldPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {product.oldPrice.toFixed(2)}€
            </span>
          )}
          <span className="text-lg font-bold text-primary">
            {product.price.toFixed(2)}€
          </span>
        </div>

        {product.installment && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {product.installment}
          </p>
        )}

        {/* Add to cart */}
        <button
          onClick={() => addItem(product)}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-orange-600 text-primary-foreground rounded-lg py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <ShoppingCart className="h-4 w-4" />
          Shto në shportë
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
