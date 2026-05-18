import type { Category, Product } from "@/data/products";

/** Resolve a human-readable label for `?sub=` from category mega menu or subcategories. */
export function resolveSubcategoryLabel(
  category: Category | undefined,
  subSlug: string,
): string | null {
  if (!category || !subSlug) return null;
  if (category.megaMenu) {
    for (const col of category.megaMenu.columns) {
      const hit = col.links.find((l) => l.slug === subSlug);
      if (hit) return hit.name;
    }
  }
  const subs = Array.isArray(category.subcategories)
    ? category.subcategories
    : [];
  const sub = subs.find((s) => s.slug === subSlug);
  return sub?.name ?? null;
}

export function productMatchesSubcategory(
  product: Product,
  parentCategorySlug: string,
  subSlug: string | null,
): boolean {
  if (!subSlug) return true;
  if (product.categorySlug !== parentCategorySlug) return false;
  if (product.subcategorySlugs?.includes(subSlug)) return true;
  const tokens = subSlug.split("-").filter((t) => t.length >= 3);
  if (tokens.length === 0) return false;
  const hay = `${product.name} ${product.description}`.toLowerCase();
  return tokens.some((t) => hay.includes(t));
}
