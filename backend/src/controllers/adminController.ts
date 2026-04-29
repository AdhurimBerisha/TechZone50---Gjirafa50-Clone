import type { Request, Response } from "express";
import { OrderStatus, PaymentStatus } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

type MegaLink = { slug?: string };
type MegaColumn = { links?: MegaLink[] };
type MegaShape = { columns?: MegaColumn[] };
type SubcatItem = { slug?: string };

function parseSubcategorySlugsFromBody(body: unknown): string[] {
  if (body === undefined || body === null) return [];
  if (!Array.isArray(body)) return [];
  return body
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function allowedSubSlugsForCategorySlug(
  categorySlug: string,
): Promise<Set<string>> {
  const set = new Set<string>();
  const row = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { subcategories: true, megaMenu: true },
  });
  if (!row) return set;
  const subs = row.subcategories as unknown;
  if (Array.isArray(subs)) {
    for (const item of subs) {
      if (
        item &&
        typeof item === "object" &&
        "slug" in item &&
        typeof (item as SubcatItem).slug === "string"
      ) {
        set.add((item as SubcatItem).slug!);
      }
    }
  }
  const mega = row.megaMenu as MegaShape | null;
  if (mega?.columns && Array.isArray(mega.columns)) {
    for (const col of mega.columns) {
      if (!col?.links || !Array.isArray(col.links)) continue;
      for (const link of col.links) {
        if (link?.slug && typeof link.slug === "string") set.add(link.slug);
      }
    }
  }
  return set;
}

async function validateSubcategorySlugsForCategory(
  categorySlug: string,
  slugs: string[],
): Promise<{ ok: true } | { ok: false; invalid: string[] }> {
  if (slugs.length === 0) return { ok: true };
  const allowed = await allowedSubSlugsForCategorySlug(categorySlug);
  if (allowed.size === 0) {
    return slugs.length ? { ok: false, invalid: [...slugs] } : { ok: true };
  }
  const invalid = slugs.filter((s) => !allowed.has(s));
  return invalid.length ? { ok: false, invalid } : { ok: true };
}

const getAdminDashboard = async (req: Request, res: Response) => {};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        categorySlug: true,
        price: true,
        oldPrice: true,
        rating: true,
        image: true,
        images: true,
        stock: true,
        isFeatured: true,
        isActive: true,
        subcategorySlugs: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
};

const getAdminOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id as string;
    const { status, paymentStatus } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const updateData: { status?: OrderStatus; paymentStatus?: PaymentStatus } =
      {};

    if (status) {
      if (!Object.values(OrderStatus).includes(status)) {
        return res.status(400).json({ error: `Invalid status: ${status}` });
      }
      updateData.status = status as OrderStatus;
    }

    if (paymentStatus) {
      if (!Object.values(PaymentStatus).includes(paymentStatus)) {
        return res
          .status(400)
          .json({ error: `Invalid paymentStatus: ${paymentStatus}` });
      }
      updateData.paymentStatus = paymentStatus as PaymentStatus;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "At least one field (status or paymentStatus) is required",
      });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({ error: "Failed to update order" });
  }
};

const getAdminSettings = async (req: Request, res: Response) => {};

const createProduct = async (req: Request, res: Response) => {
  const {
    name,
    slug,
    description,
    category,
    categorySlug,
    price,
    oldPrice,
    rating,
    image,
    images,
    stock,
    isFeatured,
    isActive,
    subcategorySlugs: subcategorySlugsBody,
  } = req.body;

  if (!name || !slug || !category || !categorySlug || price === undefined) {
    return res.status(400).json({
      error: "name, slug, category, categorySlug and price are required",
    });
  }

  const parsedPrice = Number(price);
  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    return res
      .status(400)
      .json({ error: "price must be a valid non-negative number" });
  }

  const parsedOldPrice = oldPrice !== undefined ? Number(oldPrice) : null;
  if (oldPrice !== undefined && Number.isNaN(parsedOldPrice)) {
    return res.status(400).json({ error: "oldPrice must be a valid number" });
  }

  const parsedRating = rating !== undefined ? Number(rating) : undefined;
  if (rating !== undefined && Number.isNaN(parsedRating)) {
    return res.status(400).json({ error: "rating must be a valid number" });
  }

  const parsedStock = stock !== undefined ? Number(stock) : undefined;
  if (
    stock !== undefined &&
    (!Number.isInteger(parsedStock) || parsedStock! < 0)
  ) {
    return res
      .status(400)
      .json({ error: "stock must be a valid non-negative integer" });
  }

  const normalizedImages = Array.isArray(images)
    ? images.filter((item) => typeof item === "string")
    : typeof images === "string"
      ? [images]
      : [];

  const subcategorySlugs = parseSubcategorySlugsFromBody(subcategorySlugsBody);

  try {
    const subCheck = await validateSubcategorySlugsForCategory(
      String(categorySlug),
      subcategorySlugs,
    );
    if (!subCheck.ok) {
      return res.status(400).json({
        error: `Nën-kategori të pavlefshme: ${subCheck.invalid.join(", ")}`,
      });
    }

    const categoryRow = await prisma.category.findUnique({
      where: { slug: String(categorySlug) },
    });

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        category,
        categorySlug,
        categoryId: categoryRow?.id ?? null,
        subcategorySlugs,
        price: parsedPrice,
        oldPrice: parsedOldPrice,
        rating: parsedRating ?? 0,
        image,
        images: normalizedImages,
        stock: parsedStock ?? 0,
        isFeatured: Boolean(isFeatured),
        isActive: isActive === undefined ? true : Boolean(isActive),
      },
    });

    return res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("Error creating product:", error);

    if ((error as any)?.code === "P2002") {
      return res
        .status(409)
        .json({ error: "A product with this slug already exists" });
    }

    return res.status(500).json({ error: "Failed to create product" });
  }
};

const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const productId = Array.isArray(id) ? id[0] : (id as string);
  const {
    name,
    slug,
    description,
    category,
    categorySlug,
    price,
    oldPrice,
    rating,
    image,
    images,
    stock,
    isFeatured,
    isActive,
    subcategorySlugs: subcategorySlugsBody,
  } = req.body;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  let parsedPrice: number | undefined;
  if (price !== undefined) {
    parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res
        .status(400)
        .json({ error: "price must be a valid non-negative number" });
    }
  }

  let parsedOldPrice: number | null | undefined;
  if (oldPrice !== undefined) {
    parsedOldPrice = oldPrice === null ? null : Number(oldPrice);
    if (oldPrice !== null && Number.isNaN(parsedOldPrice)) {
      return res
        .status(400)
        .json({ error: "oldPrice must be a valid number or null" });
    }
  }

  let parsedRating: number | undefined;
  if (rating !== undefined) {
    parsedRating = Number(rating);
    if (Number.isNaN(parsedRating)) {
      return res.status(400).json({ error: "rating must be a valid number" });
    }
  }

  let parsedStock: number | undefined;
  if (stock !== undefined) {
    parsedStock = Number(stock);
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      return res
        .status(400)
        .json({ error: "stock must be a valid non-negative integer" });
    }
  }

  let normalizedImages: string[] | undefined;
  if (images !== undefined) {
    normalizedImages = Array.isArray(images)
      ? images.filter((item) => typeof item === "string")
      : typeof images === "string"
        ? [images]
        : [];
  }

  try {
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (categorySlug !== undefined) {
      updateData.categorySlug = categorySlug;
      const cat = await prisma.category.findUnique({
        where: { slug: String(categorySlug) },
      });
      updateData.categoryId = cat?.id ?? null;
    }
    if (parsedPrice !== undefined) updateData.price = parsedPrice;
    if (parsedOldPrice !== undefined) updateData.oldPrice = parsedOldPrice;
    if (parsedRating !== undefined) updateData.rating = parsedRating;
    if (image !== undefined) updateData.image = image;
    if (normalizedImages !== undefined) updateData.images = normalizedImages;
    if (parsedStock !== undefined) updateData.stock = parsedStock;
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    if (subcategorySlugsBody !== undefined) {
      const subSlugs = parseSubcategorySlugsFromBody(subcategorySlugsBody);
      const existing = await prisma.product.findUnique({
        where: { id: productId },
        select: { categorySlug: true },
      });
      const slugForSubs =
        categorySlug !== undefined
          ? String(categorySlug)
          : (existing?.categorySlug ?? "");
      if (!slugForSubs) {
        return res.status(400).json({
          error:
            "Cannot set subcategories without a category slug on the product",
        });
      }
      const subCheck = await validateSubcategorySlugsForCategory(
        slugForSubs,
        subSlugs,
      );
      if (!subCheck.ok) {
        return res.status(400).json({
          error: `Nën-kategori të pavlefshme: ${subCheck.invalid.join(", ")}`,
        });
      }
      updateData.subcategorySlugs = subSlugs;
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error);

    if ((error as any)?.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }

    if ((error as any)?.code === "P2002") {
      return res
        .status(409)
        .json({ error: "A product with this slug already exists" });
    }

    return res.status(500).json({ error: "Failed to update product" });
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productId = Array.isArray(id) ? id[0] : (id as string);

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({ message: "Failed to delete product" });
  }
};

const toggleProductAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productId = Array.isArray(id) ? id[0] : (id as string);
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { isActive: !existingProduct.isActive },
    });

    return res.status(200).json({ success: true, product: updateProduct });
  } catch (error) {
    console.error("Toggle product availability error:", error);
    return res
      .status(500)
      .json({ error: "Failed to toggle product availability" });
  }
};

const getTopSellingProducts = async (req: Request, res: Response) => {
  try {
    const grouped = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const productIds = grouped.map((item) => item.productId);

    if (productIds.length === 0) {
      return res.status(200).json({ success: true, topProducts: [] });
    }

    const [products, orderItems] = await Promise.all([
      prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
        select: {
          id: true,
          name: true,
          image: true,
          category: true,
        },
      }),
      prisma.orderItem.findMany({
        where: {
          productId: {
            in: productIds,
          },
        },
        select: {
          productId: true,
          quantity: true,
          price: true,
        },
      }),
    ]);

    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );
    const revenueByProductId = orderItems.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.productId] =
          (acc[item.productId] ?? 0) + item.quantity * item.price;
        return acc;
      },
      {},
    );

    const topProducts = grouped
      .map((item) => {
        const product = productsById.get(item.productId);
        if (!product) {
          return null;
        }

        return {
          id: product.id,
          name: product.name,
          image: product.image,
          category: product.category,
          unitsSold: item._sum.quantity ?? 0,
          revenue: revenueByProductId[product.id] ?? 0,
        };
      })
      .filter(
        (product): product is NonNullable<typeof product> => product !== null,
      );

    return res.status(200).json({ success: true, topProducts });
  } catch (error) {
    console.error("Error fetching topProducts", error);
    return res.status(500).json({ error: "Failed to fetch top products" });
  }
};

const getTotalRevenue = async (req: Request, res: Response) => {
  try {
    const result = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: {
          notIn: ["CANCELLED", "DELIVERED"],
        },
      },
    });

    return res.status(200).json({
      success: true,
      totalRevenue: result._sum.total ?? 0,
    });
  } catch (error) {
    console.error("Error fetching total revenue", error);
    return res.status(500).json({ error: "Failed to fetch total revenue" });
  }
};

const getAllGiftCards = async (req: Request, res: Response) => {
  try {
    const giftCards = await prisma.giftCard.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({ success: true, giftCards });
  } catch (error) {
    console.error("Error fetching gift cards:", error);
    return res.status(500).json({ error: "Failed to fetch gift cards" });
  }
};

const createGiftCard = async (req: Request, res: Response) => {
  try {
    const {
      initialAmount,
      expiresAt,
      recipientEmail,
      recipientName,
      recipientPhone,
      message,
      currency,
    } = req.body;

    if (initialAmount === undefined) {
      return res.status(400).json({ error: "initialAmount is required" });
    }

    const parsedAmount = Number(initialAmount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return res
        .status(400)
        .json({ error: "initialAmount must be a valid positive number" });
    }

    const randomSegment = () =>
      Math.random().toString(36).toUpperCase().slice(2, 6).padEnd(4, "0");
    const displayCode = `GIFT-${randomSegment()}-${randomSegment()}-${randomSegment()}`;

    const giftCard = await prisma.giftCard.create({
      data: {
        displayCode,
        initialAmount: parsedAmount,
        currentBalance: parsedAmount,
        currency: currency ?? "EUR",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        recipientEmail: recipientEmail ?? null,
        recipientName: recipientName ?? null,
        recipientPhone: recipientPhone ?? null,
        message: message ?? null,
        status: "ACTIVE",
        activatedAt: new Date(),
      },
    });

    return res.status(201).json({ success: true, giftCard });
  } catch (error) {
    console.error("Error creating gift card", error);

    if ((error as any)?.code === "P2002") {
      return res
        .status(409)
        .json({ error: "A gift card with this code already exists, retry" });
    }

    return res.status(500).json({ error: "Failed to create gift card" });
  }
};

export {
  getAdminDashboard,
  getAllUsers,
  getAllProducts,
  getAdminOrders,
  getAdminSettings,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  getTopSellingProducts,
  getTotalRevenue,
  updateOrderStatus,
  getAllGiftCards,
  createGiftCard,
};
