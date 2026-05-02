import { useParams, Link } from "react-router";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@clerk/react";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useProductStore } from "@/stores/productStore";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  Minus,
  Plus,
  CreditCard,
  Banknote,
  Building2,
  Calculator,
} from "lucide-react";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = useProductStore((s) =>
    id ? s.getProductById(id) : undefined,
  );
  const isLoading = useProductStore((s) => s.isLoading);
  const fetchProductById = useProductStore((s) => s.fetchProductById);
  const allProducts = useProductStore((s) => s.products);
  const [quantity, setQuantity] = useState(1);
  const [installmentMonths, setInstallmentMonths] = useState(36);
  const addToCart = useCartStore((s) => s.addToCart);
  const addToCartServer = useCartStore((s) => s.addToCartServer);
  const { isInWishlist, syncToggleWishlist } = useWishlistStore();
  const { getToken, isSignedIn } = useAuth();
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);

  useEffect(() => {
    if (id) void fetchProductById(id);
  }, [fetchProductById, id]);

  if (!product && isLoading) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-semibold">Duke ngarkuar...</h1>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-semibold">Produkti nuk u gjet</h1>
        <Link to="/" className="text-primary hover:underline mt-4 inline-block">
          Kthehu në faqen kryesore
        </Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const related = allProducts
    .filter(
      (p) => p.categorySlug === product.categorySlug && p.id !== product.id,
    )
    .slice(0, 4);

  const installmentAmount = product.price / installmentMonths;

  const handleAddToCart = () => {
    void (async () => {
      try {
        if (isSignedIn === true) {
          const token = await getToken();
          if (!token) {
            toast.error("Sesioni skadoi. Hyni përsëri.");
            return;
          }
          await addToCartServer(token, product.id, quantity);
        } else {
          addToCart(product, quantity);
        }
        toast.success("Shtua në shportë");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gabim në shportë");
      }
    })();
  };

  const handleBuyNow = async () => {
    if (!isSignedIn) {
      toast.error("Ju lutem hyni për të blerë.");
      return;
    }
    if (!product.inStock) {
      toast.error("Produkti nuk është në stok.");
      return;
    }
    try {
      setIsBuyNowLoading(true);
      const token = await getToken();
      if (!token) {
        toast.error("Sesioni skadoi. Hyni përsëri.");
        return;
      }
      await addToCartServer(token, product.id, quantity);
      navigate("/payment");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Nuk u vazhdua te pagesa.");
    } finally {
      setIsBuyNowLoading(false);
    }
  };

  const handleWishlistToggle = () => {
    void (async () => {
      try {
        await syncToggleWishlist(product, { isSignedIn, getToken });
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Gabim në listën e dëshirave",
        );
      }
    })();
  };

  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary">
          Ballina
        </Link>
        <span>/</span>
        <Link
          to={`/category/${product.categorySlug}`}
          className="hover:text-primary"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-white rounded-xl border border-border p-8 flex items-center justify-center relative">
          <img
            src={product.image}
            alt={product.name}
            className="max-w-full max-h-[400px] object-contain"
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            1 / 1
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount} vlerësime)
            </span>
          </div>

          {/* Price */}
          <div className="mt-4 flex items-baseline gap-3">
            {product.oldPrice && (
              <span className="text-xl text-muted-foreground line-through">
                {product.oldPrice.toFixed(2)}€
              </span>
            )}
            <span className="text-3xl font-bold text-primary">
              {product.price.toFixed(2)}€
            </span>
          </div>
          {product.oldPrice && (
            <p className="text-sm text-green-600 font-medium mt-1">
              Ju kurseni {(product.oldPrice - product.price).toFixed(2)}€ -
              {Math.round(
                ((product.oldPrice - product.price) / product.oldPrice) * 100,
              )}
              %
            </p>
          )}

          {/* Badges */}
          <div className="flex items-center gap-2 mt-2">
            {product.isOutlet && <Badge variant="destructive">Outlet</Badge>}
            {product.badges.includes("new") && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Risi
              </Badge>
            )}
            {product.badges.includes("24h") && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                24h
              </Badge>
            )}
            {product.badges.includes("sale") && (
              <Badge variant="destructive">Në zbritje</Badge>
            )}
          </div>

          {/* Installment Calculator */}
          <div className="mt-2 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calculator className="h-4 w-4" />
              <span>Kalkulo këstet</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={installmentMonths}
                onChange={(e) => setInstallmentMonths(Number(e.target.value))}
                className="text-sm border border-border rounded px-2 py-1"
              >
                <option value={12}>12 këste</option>
                <option value={24}>24 këste</option>
                <option value={36}>36 këste</option>
              </select>
              <span className="text-sm font-medium">
                {installmentAmount.toFixed(2)}€ / muaj
              </span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ShieldCheck className="h-4 w-4" />
              Në stok
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Truck className="h-4 w-4" />
              Dërgesa 1-3 ditë
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-muted"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-600"
              >
                <ShoppingCart className="h-5 w-5" />
                Shto në shportë
              </Button>

              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`p-3 rounded-lg border transition-colors ${wishlisted ? "border-red-500 text-red-500" : "border-border text-muted-foreground hover:text-primary"}`}
              >
                <Heart
                  className={`h-5 w-5 ${wishlisted ? "fill-red-500" : ""}`}
                />
              </button>
            </div>

            <Button
              variant="outline"
              className="w-full"
              disabled={isBuyNowLoading || !product.inStock}
              onClick={() => void handleBuyNow()}
            >
              {isBuyNowLoading ? "Duke ju dërguar te pagesa..." : "Blej tani"}
            </Button>
          </div>

          {/* Shipping Info */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Truck className="h-4 w-4" />
              Transporti
            </div>
            <p className="text-sm text-muted-foreground">
              Dërgesa falas në të gjithë Kosovën
            </p>
            <p className="text-sm text-muted-foreground">
              Koha e arritjes: 1-3 ditë pune
            </p>
          </div>

          {/* Payment Methods */}
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-3">Pagesa të sigurta</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Banknote className="h-4 w-4 text-green-600" />
                <span>Para në dorë</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span>Online</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4 text-purple-600" />
                <span>Transfer</span>
              </div>
            </div>
          </div>

          {/* Warranty */}
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <ShieldCheck className="h-4 w-4" />
              <span>Garantia: 2 vite për defektet e fabrikës</span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="mt-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Përshkrimi</TabsTrigger>
              <TabsTrigger value="specs">Detajet</TabsTrigger>
              <TabsTrigger value="reviews">
                Vlerësime ({product.reviewCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <div className="prose prose-sm max-w-none">
                <p className="leading-relaxed">{product.description}</p>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="mt-4">
              <div className="border border-border rounded-lg overflow-hidden">
                {Object.entries(product.specs).map(([key, value], i) => (
                  <div
                    key={key}
                    className={`flex ${i % 2 === 0 ? "bg-muted/50" : "bg-white"}`}
                  >
                    <span className="w-1/3 px-4 py-2 text-sm font-medium text-muted-foreground">
                      {key}
                    </span>
                    <span className="w-2/3 px-4 py-2 text-sm text-foreground">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {product.rating} nga 5 yje
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount} vlerësime)
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vlerësimet do të shtohen së shpejti.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Produkte të ngjashme</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductPage;
