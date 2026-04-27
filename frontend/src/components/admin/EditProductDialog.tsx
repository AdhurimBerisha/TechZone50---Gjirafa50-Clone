import { useCallback, useEffect, useState } from "react";
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

type EditProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: BackendProduct;
};

export function EditProductDialog({
  open,
  onOpenChange,
  product,
}: EditProductDialogProps) {
  const updateProduct = useAdminStore((s) => s.updateProduct);
  const categories = useCategoryStore((s) => s.categories);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(true);
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

  const hydrateFromProduct = useCallback((p: BackendProduct) => {
    setName(p.name);
    setSlug(p.slug);
    setSlugManual(true);
    setCategorySlug(p.categorySlug);
    setPrice(String(p.price));
    setOldPrice(p.oldPrice != null ? String(p.oldPrice) : "");
    setStock(String(p.stock));
    setRating(p.rating != null ? String(p.rating) : "");
    setImage(p.image ?? p.images?.[0] ?? "");
    setDescription(p.description ?? "");
    setIsFeatured(Boolean(p.isFeatured));
    setIsActive(p.isActive !== false);
    setFormError(null);
    setSubmitting(false);
  }, []);

  useEffect(() => {
    if (open && product) {
      hydrateFromProduct(product);
    }
  }, [open, product, hydrateFromProduct]);

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

    let parsedOld: number | null | undefined;
    if (oldPrice.trim() !== "") {
      const n = Number(oldPrice);
      if (Number.isNaN(n)) {
        setFormError("Çmimi i vjetër duhet të jetë numër i vlefshëm.");
        return;
      }
      parsedOld = n;
    } else {
      parsedOld = null;
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
    };

    setSubmitting(true);
    const result = await updateProduct(product.id, payload);
    setSubmitting(false);

    if (result.ok) {
      onOpenChange(false);
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
            <DialogTitle>Ndrysho produktin</DialogTitle>
            <DialogDescription>
              Përditëso të dhënat e produktit. Slug-u duhet të mbetet unik në sistem.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="admin-edit-product-name">Emri</Label>
              <Input
                id="admin-edit-product-name"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="p.sh. Laptop Dell XPS 15"
                required
                disabled={submitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-edit-product-slug">Slug (URL)</Label>
              <Input
                id="admin-edit-product-slug"
                value={slug}
                onChange={(e) => onSlugChange(e.target.value)}
                placeholder="laptop-dell-xps-15"
                required
                disabled={submitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-edit-product-category">Kategoria</Label>
              <select
                id="admin-edit-product-category"
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="admin-edit-product-price">Çmimi (€)</Label>
                <Input
                  id="admin-edit-product-price"
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
                <Label htmlFor="admin-edit-product-old">Çmimi i vjetër (opsional)</Label>
                <Input
                  id="admin-edit-product-old"
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
                <Label htmlFor="admin-edit-product-stock">Stoku</Label>
                <Input
                  id="admin-edit-product-stock"
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
                <Label htmlFor="admin-edit-product-rating">Vlerësimi (0–5)</Label>
                <Input
                  id="admin-edit-product-rating"
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
              <Label htmlFor="admin-edit-product-image">URL e imazhit</Label>
              <Input
                id="admin-edit-product-image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                disabled={submitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-edit-product-desc">Përshkrimi</Label>
              <Textarea
                id="admin-edit-product-desc"
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
                  id="admin-edit-product-featured"
                  checked={isFeatured}
                  onCheckedChange={(v) => setIsFeatured(v === true)}
                  disabled={submitting}
                />
                <Label htmlFor="admin-edit-product-featured" className="font-normal">
                  Produkt i veçuar
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="admin-edit-product-active"
                  checked={isActive}
                  onCheckedChange={(v) => setIsActive(v === true)}
                  disabled={submitting}
                />
                <Label htmlFor="admin-edit-product-active" className="font-normal">
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
                "Ruaj ndryshimet"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
