-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('NEW', 'OPEN_BOX', 'REFURBISHED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "condition" "ProductCondition" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "isOutlet" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "outletDiscount" DOUBLE PRECISION,
ADD COLUMN     "outletStock" INTEGER;
