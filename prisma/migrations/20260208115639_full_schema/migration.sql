/*
  Warnings:

  - You are about to drop the column `sellerProfileId` on the `Follow` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `sellerStatus` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `suspensionReason` on the `User` table. All the data in the column will be lost.
  - Added the required column `shopId` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_sellerProfileId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_sellerId_fkey";

-- DropIndex
DROP INDEX "Follow_sellerProfileId_idx";

-- DropIndex
DROP INDEX "Product_categoryId_idx";

-- DropIndex
DROP INDEX "Product_shopId_idx";

-- DropIndex
DROP INDEX "Report_sellerId_idx";

-- AlterTable
ALTER TABLE "Follow" DROP COLUMN "sellerProfileId";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "sellerId",
ADD COLUMN     "shopId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "shopId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "followersCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reportsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "SellerStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "suspensionReason" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "sellerStatus",
DROP COLUMN "suspensionReason";

-- CreateTable
CREATE TABLE "Fevorite" (
    "id" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "productid" TEXT NOT NULL,

    CONSTRAINT "Fevorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fevorite_userid_key" ON "Fevorite"("userid");

-- CreateIndex
CREATE INDEX "Product_shopId_status_isActive_idx" ON "Product"("shopId", "status", "isActive");

-- CreateIndex
CREATE INDEX "Product_categoryId_status_isActive_idx" ON "Product"("categoryId", "status", "isActive");

-- CreateIndex
CREATE INDEX "Report_shopId_idx" ON "Report"("shopId");

-- AddForeignKey
ALTER TABLE "Fevorite" ADD CONSTRAINT "Fevorite_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fevorite" ADD CONSTRAINT "Fevorite_productid_fkey" FOREIGN KEY ("productid") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
