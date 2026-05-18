import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@clerk/react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdminStore } from "@/stores/adminStore";
import { useCategoryStore } from "@/stores/categoryStore";
import type { BackendProduct } from "@/stores/productStore";
import { subcategoryOptionsForCategory } from "@/lib/adminSubcategoryOptions";
import { ProductSubcategoryPicker } from "@/components/admin/ProductSubcategoryPicker";

function slugifyName(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "produkt"
  );
}

type EditProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: BackendProduct;
};

/** Build the form's initial state from a BackendProduct. */
function initialStateFromProduct(p: BackendProduct) {
  return {
    name: p.name,
    slug: p.slug,
    slugManual: true,
    categorySlug: p.categorySlug,
    price: String(p.price),
    oldPrice: p.oldPrice != null ? String(p.oldPrice) : "",
    stock: String(p.stock),
    rating: p.rating != null ? String(p.rating) : "",
    image: p.image ?? p.images?.[0] ?? "",
    description: p.description ?? "",
    isFeatured: Boolean(p.isFeatured),
    isActive: p.isActive !== false,
    subSlugs: Array.isArray(p.subcategorySlugs)
      ? p.subcategorySlugs.filter(Boolean)
      : [],
  };
}

export function EditProductDialog({
  open,
  onOpenChange,
  product,
}: EditProductDialogProps) {
  const { getToken } = useAuth();
  const updateProduct = useAdminStore((s) => s.updateProduct);
  const categories = useCategoryStore((s) => s.categories);

  // ---------------------------------------------------------------------------
  // Form state — initialised from `product` directly (no setState in effects).
  // We track `lastProductId` in state (not a ref) so that when the dialog is
  // re-opened for a different product we can reset all fields synchronously
  // during render. Using useState (not useRef) here is correct because reading
  // ref.current during render is flagged by React as an error.
  // ---------------------------------------------------------------------------
  const init = initialStateFromProduct(product);

  const [lastProductId, setLastProductId] = useState<
    BackendProduct["id"] | null
  >(null);
  const [name, setName] = useState(init.name);
  const [slug, setSlug] = useState(init.slug);
  const [slugManual, setSlugManual] = useState(init.slugManual);
  const [categorySlug, setCategorySlug] = useState(init.categorySlug);
  const [price, setPrice] = useState(init.price);
  const [oldPrice, setOldPrice] = useState(init.oldPrice);
  const [stock, setStock] = useState(init.stock);
  const [rating, setRating] = useState(init.rating);
  const [image, setImage] = useState(init.image);
  const [description, setDescription] = useState(init.description);
  const [isFeatured, setIsFeatured] = useState(init.isFeatured);
  const [isActive, setIsActive] = useState(init.isActive);
  const [subSlugs, setSubSlugs] = useState<string[]>(init.subSlugs);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Synchronously reset form fields during render whenever the dialog opens
  // for a new product OR closes. Calling setState during render is explicitly
  // supported by React for "derived state from props" resets — React discards
  // the in-progress render and immediately re-renders with the updated state.
  // We intentionally do NOT use useEffect here because setState inside an
  // effect body causes cascading renders and triggers the corresponding lint rule.
  if (open && product.id !== lastProductId) {
    // Dialog opened (or switched to a different product) — load its data.
    setLastProductId(product.id);
    const s = initialStateFromProduct(product);
    setName(s.name);
    setSlug(s.slug);
    setSlugManual(s.slugManual);
    setCategorySlug(s.categorySlug);
    setPrice(s.price);
    setOldPrice(s.oldPrice);
    setStock(s.stock);
    setRating(s.rating);
    setImage(s.image);
    setDescription(s.description);
    setIsFeatured(s.isFeatured);
    setIsActive(s.isActive);
    setSubSlugs(s.subSlugs);
    setFormError(null);
    setSubmitting(false);
  } else if (!open && lastProductId !== null) {
    // Dialog closed — clear tracked ID so the form resets next time it opens.
    setLastProductId(null);
    setFormError(null);
    setSubmitting(false);
  }

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------
  const selectedCategory = useMemo(
    () => categories.find((c) => c.slug === categorySlug),
    [categories, categorySlug],
  );

  const subOptions = useMemo(
    () => subcategoryOptionsForCategory(selectedCategory),
    [selectedCategory],
  );

  const sanitizeSubSlugs = useCallback(
    (slugs: string[], catSlug: string) => {
      const cat = categories.find((c) => c.slug === catSlug);
      const options = subcategoryOptionsForCategory(cat);
      const valid = new Set(options.map((o) => o.slug));
      return slugs.filter((s) => valid.has(s));
    },
    [categories],
  );

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleCategoryChange = (slug: string) => {
    setCategorySlug(slug);
    setSubSlugs((prev) => sanitizeSubSlugs(prev, slug));
  };

  const onNameChange = (value: string) => {
    setName(value);
    if (!slugManual) setSlug(slugifyName(value));
  };

  const onSlugChange = (value: string) => {
    setSlugManual(true);
    setSlug(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();

    if (!trimmedName || !trimmedSlug) {
      setFormError("Emri dhe slug-i janë të detyrueshëm.");
      return;
    }

    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setFormError("Çmimi duhet të jetë valid.");
      return;
    }

    const cat = categories.find((c) => c.slug === categorySlug);
    if (!cat) {
      setFormError("Zgjidh një kategori.");
      return;
    }

    const parsedStock = stock.trim() === "" ? 0 : Number(stock);
    if (
      stock.trim() !== "" &&
      (Number.isNaN(parsedStock) ||
        !Number.isInteger(parsedStock) ||
        parsedStock < 0)
    ) {
      setFormError("Stoku duhet të jetë numër i plotë jo negativ.");
      return;
    }

    const parsedOld = oldPrice.trim() !== "" ? Number(oldPrice) : undefined;
    if (parsedOld !== undefined && Number.isNaN(parsedOld)) {
      setFormError("Old price invalid.");
      return;
    }

    const parsedRating = rating.trim() !== "" ? Number(rating) : undefined;
    if (parsedRating !== undefined && Number.isNaN(parsedRating)) {
      setFormError("Rating invalid.");
      return;
    }

    const payload = {
      name: trimmedName,
      slug: trimmedSlug,
      description: description.trim() || undefined,
      category: cat,
      categorySlug: cat.slug,
      categoryId: cat.id,
      price: parsedPrice,
      oldPrice: parsedOld,
      rating: parsedRating,
      image: image.trim() || undefined,
      images: image.trim() ? [image.trim()] : [],
      stock: parsedStock,
      isFeatured,
      isActive,
      subcategorySlugs: subSlugs,
    };

    setSubmitting(true);

    const token = await getToken();
    if (!token) {
      setFormError("Sesioni skadoi. Hyni përsëri.");
      setSubmitting(false);
      return;
    }

    const result = await updateProduct(token, product.id, payload);

    setSubmitting(false);

    if (result.ok) {
      onOpenChange(false);
    } else {
      setFormError(result.error);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && submitting) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ndrysho produktin</DialogTitle>
            <DialogDescription>
              Përditëso të dhënat e produktit.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <div className="grid gap-2">
              <Label>Emri</Label>
              <Input
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => onSlugChange(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Kategoria</Label>
              <select
                value={categorySlug}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label>Nën-kategoritë</Label>
              <ProductSubcategoryPicker
                idPrefix="edit"
                options={subOptions}
                value={subSlugs}
                onChange={setSubSlugs}
                disabled={submitting}
              />
            </div>

            <div className="grid gap-2">
              <Label>Çmimi</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Stoku</Label>
              <Input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Imazhi URL</Label>
              <Input value={image} onChange={(e) => setImage(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label>Përshkrimi</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <Checkbox
                checked={isFeatured}
                onCheckedChange={(v) => setIsFeatured(v === true)}
              />
              Featured
            </div>

            <div className="flex gap-4">
              <Checkbox
                checked={isActive}
                onCheckedChange={(v) => setIsActive(v === true)}
              />
              Active
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin size-4" />
                  Duke ruajtur…
                </>
              ) : (
                "Ruaj ndryshimet"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
