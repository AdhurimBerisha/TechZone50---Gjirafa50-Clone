export type SubcategoryLink = { name: string; slug: string };

/** Coerce API/legacy category `subcategories` into a safe array. */
export function normalizeSubcategoryList(
  subcategories: unknown,
): SubcategoryLink[] {
  if (!subcategories) return [];
  if (!Array.isArray(subcategories)) return [];

  return subcategories
    .filter(
      (item): item is SubcategoryLink =>
        item != null &&
        typeof item === "object" &&
        typeof (item as SubcategoryLink).name === "string" &&
        typeof (item as SubcategoryLink).slug === "string",
    )
    .map((item) => ({
      name: item.name,
      slug: item.slug,
    }));
}
