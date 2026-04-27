import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { products as staticProducts } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal } from "lucide-react";
import { useCategoryStore } from "@/stores/categoryStore";
import { useProductStore } from "@/stores/productStore";
import {
  productMatchesSubcategory,
  resolveSubcategoryLabel,
} from "@/lib/categorySubFilter";

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const subSlug = searchParams.get("sub");

  const categories = useCategoryStore((s) => s.categories);
  const { products: fetchedProducts, fetchAllProducts } = useProductStore();

  useEffect(() => {
    void fetchAllProducts();
  }, [fetchAllProducts]);

  const allProducts = useMemo(
    () =>
      fetchedProducts.length > 0 ? fetchedProducts : staticProducts,
    [fetchedProducts],
  );

  const [sortBy, setSortBy] = useState("relevant");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);

  const category = categories.find((c) => c.slug === slug);
  const subLabel =
    subSlug && category
      ? resolveSubcategoryLabel(category, subSlug)
      : null;

  const filtered = useMemo(() => {
    if (slug === "all" || slug === "new") {
      return allProducts;
    }
    return allProducts.filter((p) => {
      const inCategory =
        p.categorySlug === slug ||
        p.category.toLowerCase().includes(slug || "");
      if (!inCategory) return false;
      if (!subSlug || !slug) return true;
      return productMatchesSubcategory(p, slug, subSlug);
    });
  }, [allProducts, slug, subSlug]);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  const pageTitle =
    subLabel && category
      ? `${category.name} — ${subLabel}`
      : category?.name || "Të gjitha produktet";

  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/" className="hover:text-primary">
          Ballina
        </Link>
        <span>/</span>
        {slug && slug !== "all" && slug !== "new" ? (
          <Link
            to={`/category/${slug}`}
            className={
              subSlug
                ? "hover:text-primary"
                : "text-foreground pointer-events-none"
            }
          >
            {category?.name || slug}
          </Link>
        ) : (
          <span className="text-foreground">Të gjitha</span>
        )}
        {subSlug && subLabel ? (
          <>
            <span>/</span>
            <span className="text-foreground">{subLabel}</span>
          </>
        ) : null}
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className="hidden lg:block w-[250px] flex-shrink-0">
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="h-4 w-4" />
              <h3 className="font-semibold text-sm">Filtrat</h3>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Çmimi</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Nga"
                  className="w-full border border-border rounded px-2 py-1 text-sm"
                  value={priceRange[0] || ""}
                  onChange={(e) =>
                    setPriceRange([Number(e.target.value), priceRange[1]])
                  }
                />
                <span className="text-muted-foreground">-</span>
                <input
                  type="number"
                  placeholder="Deri"
                  className="w-full border border-border rounded px-2 py-1 text-sm"
                  value={priceRange[1] || ""}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value)])
                  }
                />
              </div>
            </div>

            {/* Brand Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Brandi</h4>
              {["Apple", "Samsung", "MSI", "Lenovo", "Logitech", "Sony"].map(
                (brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-2 py-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <input type="checkbox" className="rounded" />
                    {brand}
                  </label>
                ),
              )}
            </div>

            {/* Subcategories */}
            {category?.subcategories && slug && (
              <div>
                <h4 className="text-sm font-medium mb-2">Nën-kategoritë</h4>
                {category.subcategories.map((sub) => (
                  <Link
                    key={sub.slug}
                    to={`/category/${slug}?sub=${encodeURIComponent(sub.slug)}`}
                    className={`block py-1 text-sm hover:text-primary ${
                      subSlug === sub.slug
                        ? "text-primary font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {sub.name}
                  </Link>
                ))}
                {subSlug ? (
                  <Link
                    to={`/category/${slug}`}
                    className="mt-2 inline-block text-xs text-muted-foreground hover:text-primary"
                  >
                    Pastro filtrin e nën-kategorisë
                  </Link>
                ) : null}
              </div>
            )}
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">{pageTitle}</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {sorted.length} produkte
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="relevant">Më relevante</option>
                <option value="price-asc">Çmimi: Ulët → Lartë</option>
                <option value="price-desc">Çmimi: Lartë → Ulët</option>
                <option value="rating">Vlerësimi</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {sorted.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nuk u gjetën produkte për këtë kategori
                {subLabel ? ` (${subLabel})` : ""}.
              </p>
              {subSlug && slug ? (
                <Link
                  to={`/category/${slug}`}
                  className="mt-3 inline-block text-sm text-primary hover:underline"
                >
                  Shiko të gjitha produktet e kësaj kategorie
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
