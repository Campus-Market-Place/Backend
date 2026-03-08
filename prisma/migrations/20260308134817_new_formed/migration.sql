/*
  Warnings:

  - The values [REPORT,FOLLOW] on the enum `InteractionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `sellerProfileId` on the `Interaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shopId,userId,action]` on the table `Interaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopId` to the `Interaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "InteractionType_new" AS ENUM ('CONTACT_CLICK', 'SOCIAL_MEDIA_CHECK', 'VIEW');
ALTER TABLE "Interaction" ALTER COLUMN "action" TYPE "InteractionType_new" USING ("action"::text::"InteractionType_new");
ALTER TYPE "InteractionType" RENAME TO "InteractionType_old";
ALTER TYPE "InteractionType_new" RENAME TO "InteractionType";
DROP TYPE "public"."InteractionType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- DropForeignKey
ALTER TABLE "Interaction" DROP CONSTRAINT "Interaction_sellerProfileId_fkey";

-- DropIndex
DROP INDEX "Interaction_sellerProfileId_idx";

-- AlterTable
ALTER TABLE "Interaction" DROP COLUMN "sellerProfileId",
ADD COLUMN     "count" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "shopId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Appeal" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "AppealStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopAnalyticsDaily" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueFollower" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "contacts" INTEGER NOT NULL DEFAULT 0,
    "socialChecks" INTEGER NOT NULL DEFAULT 0,
    "reports" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ShopAnalyticsDaily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopAnalyticsDaily_shopId_date_key" ON "ShopAnalyticsDaily"("shopId", "date");

-- CreateIndex
CREATE INDEX "Interaction_shopId_idx" ON "Interaction"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "Interaction_shopId_userId_action_key" ON "Interaction"("shopId", "userId", "action");

-- AddForeignKey
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
