import type { Request, Response } from "express";
import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

const getProducts = async (req: Request, res: Response) => {
  try {
    const outletQuery = String(req.query.outlet || "").toLowerCase();
    const outletOnly = outletQuery === "true" || outletQuery === "1";
    const where: Prisma.ProductWhereInput = {};

    if (outletOnly) {
      where.isOutlet = true;
    }

    const products = await prisma.product.findMany({ where });
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
};

const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ error: "Failed to fetch product" });
  }
};

export { getProducts, getProductById };
