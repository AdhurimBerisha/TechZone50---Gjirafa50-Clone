import type { Category } from "@/data/products";

export type SubcategoryOption = { slug: string; label: string };

/** All valid `?sub=` slugs for a category (subcategories + mega menu links), deduped. */
export function subcategoryOptionsForCategory(
  cat: Category | undefined,
): SubcategoryOption[] {
  if (!cat) return [];
  const map = new Map<string, string>();
  for (const sub of cat.subcategories) {
    map.set(sub.slug, sub.name);
  }
  if (cat.megaMenu?.columns) {
    for (const col of cat.megaMenu.columns) {
      for (const link of col.links) {
        if (!map.has(link.slug)) map.set(link.slug, link.name);
      }
    }
  }
  return [...map.entries()]
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "sq"));
}
