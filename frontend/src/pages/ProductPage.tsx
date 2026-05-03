import { useParams, Link } from "react-router";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@clerk/react";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useProductStore } from "@/stores/productStore";
import { useReviewStore, type Review } from "@/stores/reviewStore";

const reviewErrorMessage = () =>
  useReviewStore.getState().error || "Gabim gjatë ruajtjes së vlerësimit";
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
  MessageSquare,
  Edit,
  Trash2,
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

  // Review state
  const {
    reviews,
    stats,
    isLoading: reviewsLoading,
    fetchProductReviews,
    createReview,
    updateReview,
    deleteReview,
  } = useReviewStore();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  useEffect(() => {
    if (id) {
      void fetchProductById(id);
      void fetchProductReviews(id);
    }
  }, [fetchProductById, fetchProductReviews, id]);

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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const token = await getToken();
    if (!token) {
      toast.error("Sesioni skadoi. Hyni përsëri.");
      return;
    }

    try {
      if (editingReview) {
        const updated = await updateReview(
          editingReview,
          reviewForm,
          token,
        );
        if (!updated) {
          toast.error(reviewErrorMessage());
          return;
        }
        toast.success("Vlerësimi u përditësua me sukses!");
      } else {
        const created = await createReview(id, reviewForm, token);
        if (!created) {
          toast.error(reviewErrorMessage());
          return;
        }
        toast.success("Vlerësimi u shtua me sukses!");
      }

      setShowReviewForm(false);
      setEditingReview(null);
      setReviewForm({ rating: 5, title: "", comment: "" });
    } catch (error) {
      toast.error("Gabim gjatë ruajtjes së vlerësimit");
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review.id);
    setReviewForm({
      rating: review.rating,
      title: review.title || "",
      comment: review.comment,
    });
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Jeni të sigurt që dëshironi të fshini këtë vlerësim?"))
      return;

    const token = await getToken();
    if (!token) {
      toast.error("Sesioni skadoi. Hyni përsëri.");
      return;
    }

    try {
      const ok = await deleteReview(reviewId, token);
      if (!ok) {
        toast.error(
          useReviewStore.getState().error || "Gabim gjatë fshirjes së vlerësimit",
        );
        return;
      }
      toast.success("Vlerësimi u fshi me sukses!");
    } catch (error) {
      toast.error("Gabim gjatë fshirjes së vlerësimit");
    }
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    setReviewForm({ rating: 5, title: "", comment: "" });
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
                Vlerësime ({stats?.totalReviews || 0})
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
              <div className="space-y-6">
                {/* Rating Summary */}
                {stats && (
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {stats.averageRating.toFixed(1)}
                      </div>
                      <div className="flex items-center justify-center gap-0.5 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(stats.averageRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stats.totalReviews} vlerësime
                      </div>
                    </div>
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div
                          key={rating}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="w-3">{rating}</span>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{
                                width: `${
                                  stats.totalReviews > 0
                                    ? (reviews.filter(
                                        (r) => r.rating === rating,
                                      ).length /
                                        stats.totalReviews) *
                                      100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="w-8 text-muted-foreground">
                            {reviews.filter((r) => r.rating === rating).length}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Write Review Button */}
                {isSignedIn && !showReviewForm && (
                  <div className="text-center">
                    <Button
                      onClick={() => setShowReviewForm(true)}
                      variant="outline"
                      className="gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Shkruaj vlerësim
                    </Button>
                  </div>
                )}

                {/* Review Form */}
                {showReviewForm && (
                  <div className="border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingReview
                        ? "Përditëso vlerësimin"
                        : "Shkruaj vlerësim"}
                    </h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Vlerësimi *
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setReviewForm((prev) => ({
                                  ...prev,
                                  rating: star,
                                }))
                              }
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  star <= reviewForm.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Titulli (opsional)
                        </label>
                        <input
                          type="text"
                          value={reviewForm.title}
                          onChange={(e) =>
                            setReviewForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Shkruaj një titull për vlerësimin..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Komenti *
                        </label>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) =>
                            setReviewForm((prev) => ({
                              ...prev,
                              comment: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                          placeholder="Shkruaj komentin tënd..."
                          required
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" disabled={reviewsLoading}>
                          {reviewsLoading
                            ? "Duke ruajtur..."
                            : editingReview
                              ? "Përditëso"
                              : "Dërgo"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelReview}
                        >
                          Anulo
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviewsLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Duke ngarkuar vlerësimet...
                      </p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Ende nuk ka vlerësime për këtë produkt.
                      </p>
                      {isSignedIn && (
                        <Button
                          onClick={() => setShowReviewForm(true)}
                          className="mt-4"
                          variant="outline"
                        >
                          Bëhu i pari që shkruan vlerësim
                        </Button>
                      )}
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border border-border rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {review.user.name?.charAt(0)?.toUpperCase() ||
                                  "U"}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {review.user.name || "Anonim"}
                                </span>
                                {review.isVerified && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Verifikuar
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-muted-foreground/30"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(
                                    review.createdAt,
                                  ).toLocaleDateString("sq-AL")}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Edit/Delete buttons for own reviews */}
                          {isSignedIn && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditReview(review)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteReview(review.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {review.title && (
                          <h4 className="font-medium mb-2">{review.title}</h4>
                        )}
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
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
