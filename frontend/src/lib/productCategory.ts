/** Category as returned from Prisma `include: { category: true }`. */
export type ApiCategoryRef = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  sortOrder?: number;
  megaMenu?: unknown;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiCategory = string | ApiCategoryRef | null | undefined;

export type ApiSubcategoryRef = {
  id?: string;
  name?: string;
  slug?: string;
} | null;

export function categoryDisplayName(category: ApiCategory): string {
  if (typeof category === "string") return category;
  if (category && typeof category === "object" && category.name) {
    return category.name;
  }
  return "—";
}

export function categoryDisplaySlug(
  category: ApiCategory,
  fallbackSlug?: string,
): string {
  if (fallbackSlug) return fallbackSlug;
  if (category && typeof category === "object" && category.slug) {
    return category.slug;
  }
  return "";
}

export function categoryFieldsFromApi(product: {
  category?: ApiCategory;
  categorySlug?: string;
  subcategory?: ApiSubcategoryRef;
  subcategorySlugs?: string[] | null;
}): {
  category: string;
  categorySlug: string;
  subcategorySlugs?: string[];
} {
  const category = categoryDisplayName(product.category);
  const categorySlug =
    categoryDisplaySlug(product.category, product.categorySlug) || "";

  let subcategorySlugs = product.subcategorySlugs?.filter(Boolean) ?? [];
  if (subcategorySlugs.length === 0 && product.subcategory?.slug) {
    subcategorySlugs = [product.subcategory.slug];
  }

  return {
    category,
    categorySlug,
    subcategorySlugs:
      subcategorySlugs.length > 0 ? subcategorySlugs : undefined,
  };
}
