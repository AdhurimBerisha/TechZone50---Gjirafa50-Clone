import type { Request, Response } from "express";
import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
};

export { getProducts };
