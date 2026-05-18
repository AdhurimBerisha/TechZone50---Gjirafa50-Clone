import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

function serializeCategory(row: {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  sortOrder: number;
  megaMenu: unknown | null;
  subcategories: { id: string; name: string; slug: string }[];
}) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon ?? "monitor",
    sortOrder: row.sortOrder,
    subcategories: row.subcategories.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
    })),
    megaMenu: row.megaMenu ?? undefined,
  };
}

const getCategories = async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        subcategories: {
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
        },
      },
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
