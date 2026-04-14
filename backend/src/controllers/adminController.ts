import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const getAdminDashboard = async (req: Request, res: Response) => {};

const getAdminUsers = async (req: Request, res: Response) => {};

const getAdminProducts = async (req: Request, res: Response) => {};

const getAdminOrders = async (req: Request, res: Response) => {};

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

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        category,
        categorySlug,
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

const updateProduct = async (req: Request, res: Response) => {};

const deleteProduct = async (req: Request, res: Response) => {};

export {
  getAdminDashboard,
  getAdminUsers,
  getAdminProducts,
  getAdminOrders,
  getAdminSettings,
  createProduct,
};
