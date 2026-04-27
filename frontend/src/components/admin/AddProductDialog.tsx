import { useCallback, useEffect, useMemo, useState } from "react";
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
import { subcategoryOptionsForCategory } from "@/lib/adminSubcategoryOptions";
import { ProductSubcategoryPicker } from "@/components/admin/ProductSubcategoryPicker";

function slugifyName(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "produkt";
}

type AddProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
  const createProduct = useAdminStore((s) => s.createProduct);
  const categories = useCategoryStore((s) => s.categories);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [categorySlug, setCategorySlug] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [rating, setRating] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [subSlugs, setSubSlugs] = useState<string[]>([]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.slug === categorySlug),
    [categories, categorySlug],
  );
  const subOptions = useMemo(
    () => subcategoryOptionsForCategory(selectedCategory),
    [selectedCategory],
  );

  useEffect(() => {
    setSubSlugs((prev) =>
      prev.filter((s) => subOptions.some((o) => o.slug === s)),
    );
  }, [categorySlug, subOptions]);

  const reset = useCallback(() => {
    const first = categories[0]?.slug ?? "";
    setName("");
    setSlug("");
    setSlugManual(false);
    setCategorySlug(first);
    setPrice("");
    setOldPrice("");
    setStock("0");
    setRating("");
    setImage("");
    setDescription("");
    setIsFeatured(false);
    setIsActive(true);
    setSubSlugs([]);
    setFormError(null);
    setSubmitting(false);
  }, [categories]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onNameChange = (value: string) => {
    setName(value);
    if (!slugManual) {
      setSlug(slugifyName(value));
    }
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
      setFormError("Çmimi duhet të jetë një numër i vlefshëm.");
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
      (Number.isNaN(parsedStock) || !Number.isInteger(parsedStock) || parsedStock < 0)
    ) {
      setFormError("Stoku duhet të jetë numër i plotë jo negativ.");
      return;
    }

    let parsedOld: number | undefined;
    if (oldPrice.trim() !== "") {
      const n = Number(oldPrice);
      if (Number.isNaN(n)) {
        setFormError("Çmimi i vjetër duhet të jetë numër i vlefshëm.");
        return;
      }
      parsedOld = n;
    }

    let parsedRating: number | undefined;
    if (rating.trim() !== "") {
      const n = Number(rating);
      if (Number.isNaN(n)) {
        setFormError("Vlerësimi duhet të jetë numër i vlefshëm.");
        return;
      }
      parsedRating = n;
    }

    const trimmedImage = image.trim();
    const payload = {
      name: trimmedName,
      slug: trimmedSlug,
      description: description.trim() || undefined,
      category: cat.name,
      categorySlug: cat.slug,
      price: parsedPrice,
      oldPrice: parsedOld,
      rating: parsedRating,
      image: trimmedImage || undefined,
      images: trimmedImage ? [trimmedImage] : [],
      stock: parsedStock,
      isFeatured,
      isActive,
      subcategorySlugs: subSlugs,
    };

    setSubmitting(true);
    const result = await createProduct(payload);
    setSubmitting(false);

    if (result.ok) {
      onOpenChange(false);
      reset();
      return;
    }
    setFormError(result.error);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && submitting) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        className="sm:max-w-lg max-h-[min(90vh,calc(100%-2rem))] overflow-y-auto"
        showCloseButton={!submitting}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Shto produkt</DialogTitle>
            <DialogDescription>
              Plotëso fushat e detyrueshme. Slug-u duhet të jetë unik në sistem.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="admin-product-name">Emri</Label>
              <Input
                id="admin-product-name"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="p.sh. Laptop Dell XPS 15"
                required
                disabled={submitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-product-slug">Slug (URL)</Label>
              <Input
                id="admin-product-slug"
                value={slug}
                onChange={(e) => onSlugChange(e.target.value)}
                placeholder="laptop-dell-xps-15"
                required
                disabled={submitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-product-category">Kategoria</Label>
              <select
                id="admin-product-category"
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                disabled={submitting}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label>Nën-kategoritë (filtri mega-menu)</Label>
              <ProductSubcategoryPicker
                idPrefix="admin-add-sub"
                options={subOptions}
                value={subSlugs}
                onChange={setSubSlugs}
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="admin-product-price">Çmimi (€)</Label>
                <Input
                  id="admin-product-price"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-product-old">Çmimi i vjetër (opsional)</Label>
                <Input
                  id="admin-product-old"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value)}
                  placeholder="—"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="admin-product-stock">Stoku</Label>
                <Input
                  id="admin-product-stock"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-product-rating">Vlerësimi (0–5)</Label>
                <Input
                  id="admin-product-rating"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={5}
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="0"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-product-image">URL e imazhit</Label>
              <Input
                id="admin-product-image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                disabled={submitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-product-desc">Përshkrimi</Label>
              <Textarea
                id="admin-product-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Përshkrim i shkurtër i produktit…"
                disabled={submitting}
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="admin-product-featured"
                  checked={isFeatured}
                  onCheckedChange={(v) => setIsFeatured(v === true)}
                  disabled={submitting}
                />
                <Label htmlFor="admin-product-featured" className="font-normal">
                  Produkt i veçuar
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="admin-product-active"
                  checked={isActive}
                  onCheckedChange={(v) => setIsActive(v === true)}
                  disabled={submitting}
                />
                <Label htmlFor="admin-product-active" className="font-normal">
                  Aktiv në dyqan
                </Label>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Anulo
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Duke ruajtur…
                </>
              ) : (
                "Ruaj produktin"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
