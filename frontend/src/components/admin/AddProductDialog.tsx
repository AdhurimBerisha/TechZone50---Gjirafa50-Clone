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

export function AddProductDialog({
  open,
  onOpenChange,
}: AddProductDialogProps) {
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
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isOutlet, setIsOutlet] = useState(false);
  const [outletDiscount, setOutletDiscount] = useState("");
  const [outletStock, setOutletStock] = useState("");
  const [condition, setCondition] = useState<"NEW" | "OPEN_BOX" | "REFURBISHED">("NEW");
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
    setImage(null);
    setImagePreview("");
    setDescription("");
    setIsFeatured(false);
    setIsActive(true);
    setIsOutlet(false);
    setOutletDiscount("");
    setOutletStock("");
    setCondition("NEW");
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
      (Number.isNaN(parsedStock) ||
        !Number.isInteger(parsedStock) ||
        parsedStock < 0)
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

    let parsedOutletDiscount: number | undefined;
    if (outletDiscount.trim() !== "") {
      const n = Number(outletDiscount);
      if (Number.isNaN(n) || n < 0) {
        setFormError("Zbritja e outlet duhet të jetë numër jo negativ.");
        return;
      }
      parsedOutletDiscount = n;
    }

    let parsedOutletStock: number | undefined;
    if (outletStock.trim() !== "") {
      const n = Number(outletStock);
      if (Number.isNaN(n) || !Number.isInteger(n) || n < 0) {
        setFormError("Stoku i outlet duhet të jetë numër i plotë jo negativ.");
        return;
      }
      parsedOutletStock = n;
    }

    const trimmedImage = imagePreview.trim();
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
      isOutlet,
      outletDiscount: parsedOutletDiscount,
      outletStock: parsedOutletStock,
      condition,
    };

    setSubmitting(true);

    // Create FormData for file upload
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, item));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Add the image file if present
    if (image) {
      formData.append("image", image);
    }

    const result = await createProduct(formData);
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
                <Label htmlFor="admin-product-old">
                  Çmimi i vjetër (opsional)
                </Label>
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
              <Label htmlFor="admin-product-image">Imazhi i produktit</Label>
              <Input
                id="admin-product-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImage(file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setImagePreview(e.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setImagePreview("");
                  }
                }}
                disabled={submitting}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-32 max-h-32 object-cover rounded border"
                  />
                </div>
              )}
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

            <div className="grid gap-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Opsionet e Outlet</h3>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="admin-product-outlet"
                  checked={isOutlet}
                  onCheckedChange={(v) => setIsOutlet(v === true)}
                  disabled={submitting}
                />
                <Label htmlFor="admin-product-outlet" className="font-normal">
                  Produkt Outlet
                </Label>
              </div>

              {isOutlet && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="admin-product-outlet-discount">Zbritja e Outlet (€)</Label>
                      <Input
                        id="admin-product-outlet-discount"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        value={outletDiscount}
                        onChange={(e) => setOutletDiscount(e.target.value)}
                        placeholder="0.00"
                        disabled={submitting}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="admin-product-outlet-stock">Stoku i Outlet</Label>
                      <Input
                        id="admin-product-outlet-stock"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        value={outletStock}
                        onChange={(e) => setOutletStock(e.target.value)}
                        placeholder="0"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="admin-product-condition">Gjendja</Label>
                    <select
                      id="admin-product-condition"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as "NEW" | "OPEN_BOX" | "REFURBISHED")}
                      disabled={submitting}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                    >
                      <option value="NEW">I ri</option>
                      <option value="OPEN_BOX">Paketë e hapur</option>
                      <option value="REFURBISHED">I rinovuar</option>
                    </select>
                  </div>
                </>
              )}
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
