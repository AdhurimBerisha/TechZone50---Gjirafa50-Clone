-- AlterTable
ALTER TABLE "Product" ADD COLUMN "subcategorySlugs" TEXT[] DEFAULT ARRAY[]::TEXT[];
