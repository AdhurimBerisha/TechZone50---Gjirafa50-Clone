import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Prisma } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";

type SeedCategory = {
  name: string;
  slug: string;
  icon: string;
  subcategories: unknown;
  megaMenu?: unknown;
};

async function main(): Promise<void> {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const categoriesPath = join(
    __dirname,
    "../../frontend/src/data/categories.json",
  );
  const raw = readFileSync(categoriesPath, "utf-8");
  const items = JSON.parse(raw) as SeedCategory[];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;
    const mega =
      item.megaMenu != null
        ? { megaMenu: item.megaMenu as Prisma.InputJsonValue }
        : {};

    await prisma.category.upsert({
      where: { slug: item.slug },
      create: {
        slug: item.slug,
        name: item.name,
        icon: item.icon,
        sortOrder: i,
        subcategories: item.subcategories as Prisma.InputJsonValue,
        ...mega,
      },
      update: {
        name: item.name,
        icon: item.icon,
        sortOrder: i,
        subcategories: item.subcategories as Prisma.InputJsonValue,
        ...mega,
      },
    });
  }

  const categories = await prisma.category.findMany();
  for (const c of categories) {
    await prisma.product.updateMany({
      where: { categorySlug: c.slug },
      data: { categoryId: c.id },
    });
  }

  console.log(`Seeded ${items.length} categories and linked products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
