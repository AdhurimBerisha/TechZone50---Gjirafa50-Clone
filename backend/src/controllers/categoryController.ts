import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

function serializeCategory(row: {
  id: string;
  slug: string;
  name: string;
  icon: string;
  sortOrder: number;
  subcategories: unknown;
  megaMenu: unknown | null;
}) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon,
    sortOrder: row.sortOrder,
    subcategories: row.subcategories,
    megaMenu: row.megaMenu ?? undefined,
  };
}

const getCategories = async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return res.status(200).json({
      success: true,
      categories: rows.map(serializeCategory),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export { getCategories };
