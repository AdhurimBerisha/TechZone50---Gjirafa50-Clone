import type { Category } from "@/data/products";

export type ProductSpecificationInput = {
  group?: string | null;
  key: string;
  value: string;
};

export type ProductVariantOptionInput = {
  name: string;
  value: string;
};

export type ProductVariantInput = {
  name: string;
  sku?: string | null;
  price?: number | null;
  stock?: number;
  image?: string | null;
  isActive?: boolean;
  options?: ProductVariantOptionInput[];
};

/** Body for POST /api/admin/products (matches adminController.createProduct). */
export type CreateProductPayload = {
  name: string;
  slug: string;
  price: number;
  description?: string;
  sku?: string;
  brand?: string;
  model?: string;
  oldPrice?: number | null;
  stock?: number;
  reservedStock?: number;
  weight?: number | null;
  isFeatured?: boolean;
  isActive?: boolean;
  isOutlet?: boolean;
  outletDiscount?: number | null;
  outletStock?: number | null;
  condition?: "NEW" | "OPEN_BOX" | "REFURBISHED";
  categoryId?: string;
  subcategoryId?: string;
  image?: string;
  images?: string[];
  specifications?: ProductSpecificationInput[];
  variants?: ProductVariantInput[];
};

/** Partial body for PUT /api/admin/products/:id (matches adminController.updateProduct). */
export type UpdateProductPayload = {
  name?: string;
  slug?: string;
  description?: string;
  sku?: string;
  brand?: string;
  model?: string;
  price?: number;
  oldPrice?: number | null;
  rating?: number;
  stock?: number;
  reservedStock?: number;
  weight?: number | null;
  isFeatured?: boolean;
  isActive?: boolean;
  isOutlet?: boolean;
  outletDiscount?: number | null;
  outletStock?: number | null;
  condition?: "NEW" | "OPEN_BOX" | "REFURBISHED";
  categoryId?: string | null;
  subcategoryId?: string | null;
  image?: string;
  images?: string[];
  specifications?: ProductSpecificationInput[];
  variants?: ProductVariantInput[];
};

export type CreateProductInput = CreateProductPayload & {
  imageFile?: File | null;
};

/** Map category slug + first selected sub slug to Prisma relation ids. */
export function resolveCategoryRelationIds(
  categories: Category[],
  categorySlug: string,
  subSlugs: string[],
): { categoryId: string; subcategoryId?: string } | { error: string } {
  const cat = categories.find((c) => c.slug === categorySlug);
  if (!cat?.id) {
    return { error: "Kategoria nuk u gjet në sistem." };
  }

  const firstSubSlug = subSlugs[0];
  if (!firstSubSlug) {
    return { categoryId: cat.id };
  }

  const sub = cat.subcategories.find((s) => s.slug === firstSubSlug);
  if (!sub?.id) {
    return {
      error:
        "Nën-kategoria nuk u gjet. Rifresko kategoritë ose zgjidh një nën-kategori të vlefshme.",
    };
  }

  return { categoryId: cat.id, subcategoryId: sub.id };
}

function appendFormValue(fd: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) return;

  if (Array.isArray(value)) {
    if (key === "images") {
      value.forEach((item) => {
        if (typeof item === "string" && item) fd.append("images", item);
      });
      return;
    }
    if (key === "specifications" || key === "variants") {
      fd.append(key, JSON.stringify(value));
      return;
    }
    value.forEach((item) => fd.append(key, String(item)));
    return;
  }

  if (typeof value === "boolean") {
    fd.append(key, value ? "true" : "false");
    return;
  }

  fd.append(key, String(value));
}

/** Build multipart body for POST /api/admin/products (multer + JSON fields). */
export function buildCreateProductFormData(
  payload: CreateProductPayload,
  imageFile?: File | null,
): FormData {
  const fd = new FormData();
  const {
    name,
    slug,
    price,
    description,
    sku,
    brand,
    model,
    oldPrice,
    stock,
    reservedStock,
    weight,
    isFeatured,
    isActive,
    isOutlet,
    outletDiscount,
    outletStock,
    condition,
    categoryId,
    subcategoryId,
    image,
    images,
    specifications,
    variants,
  } = payload;

  appendFormValue(fd, "name", name);
  appendFormValue(fd, "slug", slug);
  appendFormValue(fd, "price", price);
  appendFormValue(fd, "description", description);
  appendFormValue(fd, "sku", sku);
  appendFormValue(fd, "brand", brand);
  appendFormValue(fd, "model", model);
  appendFormValue(fd, "oldPrice", oldPrice);
  appendFormValue(fd, "stock", stock);
  appendFormValue(fd, "reservedStock", reservedStock);
  appendFormValue(fd, "weight", weight);
  appendFormValue(fd, "isFeatured", isFeatured);
  appendFormValue(fd, "isActive", isActive);
  appendFormValue(fd, "isOutlet", isOutlet);
  appendFormValue(fd, "outletDiscount", outletDiscount);
  appendFormValue(fd, "outletStock", outletStock);
  appendFormValue(fd, "condition", condition);
  appendFormValue(fd, "categoryId", categoryId);
  appendFormValue(fd, "subcategoryId", subcategoryId);
  appendFormValue(fd, "image", image);
  appendFormValue(fd, "images", images);
  appendFormValue(fd, "specifications", specifications);
  appendFormValue(fd, "variants", variants);

  if (imageFile) {
    fd.append("image", imageFile);
  }

  return fd;
}

export function extractAdminApiError(error: unknown, fallback: string): string {
  const axiosError = error as {
    response?: { data?: { error?: string; message?: string } };
  };
  return (
    axiosError.response?.data?.error ??
    axiosError.response?.data?.message ??
    fallback
  );
}

/** Strip undefined keys for JSON PUT /api/admin/products/:id */
export function compactUpdatePayload(
  payload: UpdateProductPayload,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined),
  );
}
