import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

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
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (categorySlug !== undefined) updateData.categorySlug = categorySlug;
    if (parsedPrice !== undefined) updateData.price = parsedPrice;
    if (parsedOldPrice !== undefined) updateData.oldPrice = parsedOldPrice;
    if (parsedRating !== undefined) updateData.rating = parsedRating;
    if (image !== undefined) updateData.image = image;
    if (normalizedImages !== undefined) updateData.images = normalizedImages;
    if (parsedStock !== undefined) updateData.stock = parsedStock;
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

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

const getAllOrders = async (req: Request, res: Response) => {
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
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
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
  getAllOrders,
};
