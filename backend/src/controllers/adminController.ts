import type { Request, Response } from "express";
import { OrderStatus, PaymentStatus } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import cloudinary from "../lib/cloudinary";

function parseBoolean(value: unknown, defaultValue: boolean): boolean {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return Boolean(value);
}

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
    include: {
      subcategories: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!row) return set;

  // REAL subcategories (relation)
  for (const sub of row.subcategories) {
    if (sub.slug) set.add(sub.slug);
  }

  // megaMenu is JSON → keep your logic but type it safely
  const mega = row.megaMenu as any;

  if (mega?.columns && Array.isArray(mega.columns)) {
    for (const col of mega.columns) {
      if (!col?.links || !Array.isArray(col.links)) continue;

      for (const link of col.links) {
        if (link?.slug) set.add(link.slug);
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
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        subcategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        specifications: {
          orderBy: {
            group: "asc",
          },
        },

        variants: {
          include: {
            options: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },

        reviews: {
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            isVerified: true,
            createdAt: true,

            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },

        _count: {
          select: {
            reviews: true,
            wishlistItems: true,
            cartItems: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);

    return res.status(500).json({
      error: "Failed to fetch products",
    });
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

const getAdminSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });
    return res.status(200).json(settings ?? {});
  } catch (error) {
    console.error("Error fetching settings:", error);
    return res.status(500).json({ error: "Failed to fetch settings" });
  }
};

const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      // Basic Info
      name,
      slug,
      description,

      // Product Identity
      sku,
      brand,
      model,

      // Pricing
      price,
      oldPrice,

      // Inventory
      stock,
      reservedStock,

      // Physical
      weight,

      // Status
      isFeatured,
      isActive,

      // Outlet
      isOutlet,
      outletDiscount,
      outletStock,

      // Condition
      condition,

      // Relations
      categoryId,
      subcategoryId,

      // Media
      image,
      images,

      // Relational data
      specifications,
      variants,
    } = req.body;

    // Required validation
    if (!name || !slug || price === undefined) {
      return res.status(400).json({
        error: "name, slug and price are required",
      });
    }

    // Price
    const parsedPrice = Number(price);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        error: "price must be a valid non-negative number",
      });
    }

    // Old price
    const parsedOldPrice =
      oldPrice !== undefined && oldPrice !== null ? Number(oldPrice) : null;

    if (
      oldPrice !== undefined &&
      oldPrice !== null &&
      Number.isNaN(parsedOldPrice)
    ) {
      return res.status(400).json({
        error: "oldPrice must be a valid number",
      });
    }

    // Stock
    const parsedStock = stock !== undefined ? Number(stock) : 0;

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        error: "stock must be a valid non-negative integer",
      });
    }

    // Reserved stock
    const parsedReservedStock =
      reservedStock !== undefined ? Number(reservedStock) : 0;

    if (!Number.isInteger(parsedReservedStock) || parsedReservedStock < 0) {
      return res.status(400).json({
        error: "reservedStock must be a valid non-negative integer",
      });
    }

    // Weight
    const parsedWeight =
      weight !== undefined && weight !== null ? Number(weight) : null;

    if (weight !== undefined && weight !== null && Number.isNaN(parsedWeight)) {
      return res.status(400).json({
        error: "weight must be a valid number",
      });
    }

    // Outlet discount
    const parsedOutletDiscount =
      outletDiscount !== undefined && outletDiscount !== null
        ? Number(outletDiscount)
        : null;

    if (
      outletDiscount !== undefined &&
      outletDiscount !== null &&
      Number.isNaN(parsedOutletDiscount)
    ) {
      return res.status(400).json({
        error: "outletDiscount must be a valid number",
      });
    }

    // Outlet stock
    const parsedOutletStock =
      outletStock !== undefined && outletStock !== null
        ? Number(outletStock)
        : null;

    if (
      parsedOutletStock !== null &&
      (!Number.isInteger(parsedOutletStock) || parsedOutletStock < 0)
    ) {
      return res.status(400).json({
        error: "outletStock must be a valid non-negative integer",
      });
    }

    // Condition validation
    const validConditions = ["NEW", "OPEN_BOX", "REFURBISHED"];

    if (condition !== undefined && !validConditions.includes(condition)) {
      return res.status(400).json({
        error: "condition must be one of: NEW, OPEN_BOX, REFURBISHED",
      });
    }

    // Normalize images
    const normalizedImages = Array.isArray(images)
      ? images.filter(
          (item: unknown): item is string => typeof item === "string",
        )
      : typeof images === "string"
        ? [images]
        : [];

    // Upload image
    let imageUrl = image;

    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "products",
              public_id: slug || `product-${Date.now()}`,
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );

          stream.end(req.file!.buffer);
        });

        imageUrl = (result as any).secure_url;
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);

        return res.status(500).json({
          error: "Failed to upload image",
        });
      }
    }

    // Add uploaded image to images array
    if (imageUrl && !normalizedImages.includes(imageUrl)) {
      normalizedImages.unshift(imageUrl);
    }

    // Validate category
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!categoryExists) {
        return res.status(404).json({
          error: "Category not found",
        });
      }
    }

    // Validate subcategory
    if (subcategoryId) {
      const subcategoryExists = await prisma.subcategory.findUnique({
        where: { id: subcategoryId },
      });

      if (!subcategoryExists) {
        return res.status(404).json({
          error: "Subcategory not found",
        });
      }
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        // Basic Info
        name,
        slug,
        description,

        // Identity
        sku,
        brand,
        model,

        // Pricing
        price: parsedPrice,
        oldPrice: parsedOldPrice,

        // Media
        image: imageUrl,
        images: normalizedImages,

        // Inventory
        stock: parsedStock,
        reservedStock: parsedReservedStock,

        // Physical
        weight: parsedWeight,

        // Status
        isFeatured: parseBoolean(isFeatured, false),

        isActive: parseBoolean(isActive, true),

        // Outlet
        isOutlet: parseBoolean(isOutlet, false),

        outletDiscount: parsedOutletDiscount,
        outletStock: parsedOutletStock,

        // Condition
        condition: condition || "NEW",

        // Category relation
        ...(categoryId
          ? {
              category: {
                connect: {
                  id: categoryId,
                },
              },
            }
          : {}),

        // Subcategory relation
        ...(subcategoryId
          ? {
              subcategory: {
                connect: {
                  id: subcategoryId,
                },
              },
            }
          : {}),

        // Specifications
        ...(Array.isArray(specifications) && specifications.length > 0
          ? {
              specifications: {
                create: specifications.map((spec: any) => ({
                  group: spec.group || null,
                  key: spec.key,
                  value: spec.value,
                })),
              },
            }
          : {}),

        // Variants
        ...(Array.isArray(variants) && variants.length > 0
          ? {
              variants: {
                create: variants.map((variant: any) => ({
                  name: variant.name,

                  sku: variant.sku || null,

                  price:
                    variant.price !== undefined && variant.price !== null
                      ? Number(variant.price)
                      : null,

                  stock:
                    variant.stock !== undefined ? Number(variant.stock) : 0,

                  image: variant.image || null,

                  isActive:
                    variant.isActive === undefined
                      ? true
                      : Boolean(variant.isActive),

                  ...(Array.isArray(variant.options) &&
                  variant.options.length > 0
                    ? {
                        options: {
                          create: variant.options.map((option: any) => ({
                            name: option.name,
                            value: option.value,
                          })),
                        },
                      }
                    : {}),
                })),
              },
            }
          : {}),
      },

      include: {
        category: true,
        subcategory: true,

        specifications: true,

        variants: {
          include: {
            options: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    if ((error as any)?.code === "P2002") {
      return res.status(409).json({
        error: "A product with this slug or SKU already exists",
      });
    }

    return res.status(500).json({
      error: "Failed to create product",
    });
  }
};

const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productId = Array.isArray(id) ? id[0] : (id as string);

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const {
      name,
      slug,
      description,
      sku,
      brand,
      model,
      price,
      oldPrice,
      rating,
      image,
      images,
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
      specifications,
      variants,
    } = req.body;

    const data: Record<string, unknown> = {};

    if (name !== undefined) data.name = name;
    if (slug !== undefined) data.slug = slug;
    if (description !== undefined) data.description = description;
    if (sku !== undefined) data.sku = sku;
    if (brand !== undefined) data.brand = brand;
    if (model !== undefined) data.model = model;

    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return res
          .status(400)
          .json({ error: "price must be a valid non-negative number" });
      }
      data.price = parsedPrice;
    }

    if (oldPrice !== undefined) {
      const parsedOldPrice = oldPrice === null ? null : Number(oldPrice);
      if (oldPrice !== null && Number.isNaN(parsedOldPrice)) {
        return res
          .status(400)
          .json({ error: "oldPrice must be a valid number or null" });
      }
      data.oldPrice = parsedOldPrice;
    }

    if (rating !== undefined) {
      const parsedRating = Number(rating);
      if (Number.isNaN(parsedRating)) {
        return res.status(400).json({ error: "rating must be a valid number" });
      }
      data.rating = parsedRating;
    }

    if (stock !== undefined) {
      const parsedStock = Number(stock);
      if (!Number.isInteger(parsedStock) || parsedStock < 0) {
        return res
          .status(400)
          .json({ error: "stock must be a valid non-negative integer" });
      }
      data.stock = parsedStock;
    }

    if (reservedStock !== undefined) {
      const parsedReservedStock = Number(reservedStock);
      if (!Number.isInteger(parsedReservedStock) || parsedReservedStock < 0) {
        return res.status(400).json({
          error: "reservedStock must be a valid non-negative integer",
        });
      }
      data.reservedStock = parsedReservedStock;
    }

    if (weight !== undefined) {
      const parsedWeight = weight === null ? null : Number(weight);
      if (weight !== null && Number.isNaN(parsedWeight)) {
        return res.status(400).json({ error: "weight must be a valid number" });
      }
      data.weight = parsedWeight;
    }

    if (isFeatured !== undefined) data.isFeatured = parseBoolean(isFeatured, false);
    if (isActive !== undefined) data.isActive = parseBoolean(isActive, true);
    if (isOutlet !== undefined) data.isOutlet = parseBoolean(isOutlet, false);

    if (outletDiscount !== undefined) {
      const parsedOutletDiscount =
        outletDiscount === null ? null : Number(outletDiscount);
      if (
        outletDiscount !== null &&
        Number.isNaN(parsedOutletDiscount)
      ) {
        return res
          .status(400)
          .json({ error: "outletDiscount must be a valid number" });
      }
      data.outletDiscount = parsedOutletDiscount;
    }

    if (outletStock !== undefined) {
      const parsedOutletStock =
        outletStock === null ? null : Number(outletStock);
      if (
        parsedOutletStock !== null &&
        (!Number.isInteger(parsedOutletStock) || parsedOutletStock < 0)
      ) {
        return res
          .status(400)
          .json({ error: "outletStock must be a valid non-negative integer" });
      }
      data.outletStock = parsedOutletStock;
    }

    if (condition !== undefined) {
      const validConditions = ["NEW", "OPEN_BOX", "REFURBISHED"];
      if (!validConditions.includes(condition)) {
        return res.status(400).json({
          error: "condition must be one of: NEW, OPEN_BOX, REFURBISHED",
        });
      }
      data.condition = condition;
    }

    if (images !== undefined) {
      data.images = Array.isArray(images)
        ? images.filter((item: unknown) => typeof item === "string")
        : typeof images === "string"
          ? [images]
          : [];
    }

    let imageUrl = image;
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "products",
              public_id: slug || `product-${Date.now()}`,
              resource_type: "image",
            },
            (error, uploadResult) => {
              if (error) reject(error);
              else resolve(uploadResult);
            },
          );
          stream.end(req.file!.buffer);
        });
        imageUrl = (result as { secure_url: string }).secure_url;
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        return res.status(500).json({ error: "Failed to upload image" });
      }
    }

    if (imageUrl !== undefined) {
      data.image = imageUrl;
      if (Array.isArray(data.images)) {
        const imgs = data.images as string[];
        if (imageUrl && !imgs.includes(imageUrl)) {
          data.images = [imageUrl, ...imgs];
        }
      }
    }

    if (categoryId !== undefined) {
      if (categoryId === null || categoryId === "") {
        data.category = { disconnect: true };
      } else {
        const categoryExists = await prisma.category.findUnique({
          where: { id: String(categoryId) },
        });
        if (!categoryExists) {
          return res.status(404).json({ error: "Category not found" });
        }
        data.category = { connect: { id: String(categoryId) } };
      }
    }

    if (subcategoryId !== undefined) {
      if (subcategoryId === null || subcategoryId === "") {
        data.subcategory = { disconnect: true };
      } else {
        const subcategoryExists = await prisma.subcategory.findUnique({
          where: { id: String(subcategoryId) },
        });
        if (!subcategoryExists) {
          return res.status(404).json({ error: "Subcategory not found" });
        }
        data.subcategory = { connect: { id: String(subcategoryId) } };
      }
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: data as Parameters<typeof prisma.product.update>[0]["data"],
      include: {
        category: true,
        subcategory: true,
        specifications: true,
        variants: { include: { options: true } },
      },
    });

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error);

    if ((error as { code?: string })?.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }

    if ((error as { code?: string })?.code === "P2002") {
      return res
        .status(409)
        .json({ error: "A product with this slug or SKU already exists" });
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

    return res.status(200).json({ success: true, product: updatedProduct });
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
      quantity = 1,
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

    const parsedQuantity = Math.max(1, Math.min(1000, Number(quantity) || 1));

    const randomSegment = () =>
      Math.random().toString(36).toUpperCase().slice(2, 6).padEnd(4, "0");
    const generateDisplayCode = () =>
      `GIFT-${randomSegment()}-${randomSegment()}-${randomSegment()}`;

    // Create multiple gift cards with the same denomination (infinite stock)
    const giftCards = await prisma.giftCard.createMany({
      data: Array.from({ length: parsedQuantity }, () => ({
        displayCode: generateDisplayCode(),
        code: generateDisplayCode(),
        initialAmount: parsedAmount,
        currentBalance: parsedAmount,
        currency: currency ?? "EUR",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        recipientEmail: recipientEmail ?? null,
        recipientName: recipientName ?? null,
        recipientPhone: recipientPhone ?? null,
        message: message ?? null,
        status: "ACTIVE" as const,
        activatedAt: new Date(),
      })),
    });

    return res.status(201).json({
      success: true,
      message: `Created ${giftCards.count} gift cards`,
      count: giftCards.count,
    });
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

const createAdminSettings = async (req: Request, res: Response) => {
  try {
    const existing = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: "Store settings already exist. Use update instead." });
    }

    const {
      storeName,
      storeEmail,
      storePhone,
      storeDescription,
      street,
      city,
      state,
      zipCode,
      shippingPrice,
      freeShippingThreshold,
      deliveryTime,
      metaTitle,
      metaDescription,
      facebook,
      instagram,
      tiktok,
    } = req.body;

    const settings = await prisma.storeSettings.create({
      data: {
        id: "default",
        storeName,
        storeEmail,
        storePhone,
        storeDescription,
        street,
        city,
        state,
        zipCode,
        shippingPrice: shippingPrice ? parseFloat(shippingPrice) : 0,
        freeShippingThreshold: freeShippingThreshold
          ? parseFloat(freeShippingThreshold)
          : null,
        deliveryTime,
        metaTitle,
        metaDescription,
        facebook,
        instagram,
        tiktok,
      },
    });

    return res.status(201).json(settings);
  } catch (error) {
    console.error("Error creating admin settings", error);
    return res.status(500).json({ error: "Failed to create admin settings" });
  }
};

const updateAdminSettings = async (req: Request, res: Response) => {
  try {
    const existing = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ error: "Store settings not found. Use create instead." });
    }

    const {
      storeName,
      storeEmail,
      storePhone,
      storeDescription,
      street,
      city,
      state,
      zipCode,
      shippingPrice,
      freeShippingThreshold,
      deliveryTime,
      metaTitle,
      metaDescription,
      facebook,
      instagram,
      tiktok,
    } = req.body;

    const updateData: Record<string, unknown> = {};

    if (storeName !== undefined) updateData.storeName = storeName;
    if (storeEmail !== undefined) updateData.storeEmail = storeEmail;
    if (storePhone !== undefined) updateData.storePhone = storePhone;
    if (storeDescription !== undefined)
      updateData.storeDescription = storeDescription;
    if (street !== undefined) updateData.street = street;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zipCode !== undefined) updateData.zipCode = zipCode;
    if (shippingPrice !== undefined)
      updateData.shippingPrice = parseFloat(shippingPrice);
    if (freeShippingThreshold !== undefined)
      updateData.freeShippingThreshold =
        freeShippingThreshold === null
          ? null
          : parseFloat(freeShippingThreshold);
    if (deliveryTime !== undefined) updateData.deliveryTime = deliveryTime;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined)
      updateData.metaDescription = metaDescription;
    if (facebook !== undefined) updateData.facebook = facebook;
    if (instagram !== undefined) updateData.instagram = instagram;
    if (tiktok !== undefined) updateData.tiktok = tiktok;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    const settings = await prisma.storeSettings.update({
      where: { id: "default" },
      data: updateData,
    });

    return res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error("Error updating admin settings", error);
    return res.status(500).json({ error: "Failed to update admin settings" });
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
  createAdminSettings,
  updateAdminSettings,
};
