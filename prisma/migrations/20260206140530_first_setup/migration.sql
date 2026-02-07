-- CreateEnum
CREATE TYPE "VerificationLevel" AS ENUM ('BASIC', 'VERIFIED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "SellerStatuses" AS ENUM ('PENDING', 'APPROVED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "ImageStatus" AS ENUM ('APPROVED', 'PENDING', 'REVIEW', 'REJECTED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'SELLER', 'BOTH');

-- CreateEnum
CREATE TYPE "SellerStatus" AS ENUM ('NONE', 'APPROVED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('CONTACT_CLICK', 'SOCIAL_MEDIA_CHECK', 'REPORT', 'FOLLOW');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REPORT', 'INTERACTION', 'WARNING', 'INFO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "sellerStatus" "SellerStatus" NOT NULL DEFAULT 'NONE',
    "suspensionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "campusLocation" TEXT NOT NULL,
    "verificationStatus" "SellerStatuses" NOT NULL DEFAULT 'PENDING',
    "verificationScore" INTEGER,
    "verificationLevel" "VerificationLevel",
    "frontImageHash" TEXT NOT NULL,
    "backImageHash" TEXT NOT NULL,
    "verificationReason" TEXT,
    "mainPhone" TEXT NOT NULL,
    "secondaryPhone" TEXT,
    "telegram" TEXT,
    "instagram" TEXT,
    "tiktok" TEXT,
    "other" TEXT[],
    "agreedToRules" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SellerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER,
    "categoryId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "varified" BOOLEAN NOT NULL DEFAULT false,
    "status" "ImageStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "phash" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "status" "ImageStatus" NOT NULL,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "reasons" TEXT[],
    "cameraMake" TEXT,
    "cameraModel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reporterId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL,
    "action" "InteractionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "sellerProfileId" TEXT NOT NULL,

    CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sellerProfileId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyStats" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "followersGained" INTEGER NOT NULL DEFAULT 0,
    "reportsCount" INTEGER NOT NULL DEFAULT 0,
    "contactClicks" INTEGER NOT NULL DEFAULT 0,
    "socialMediaChecks" INTEGER NOT NULL DEFAULT 0,
    "sellerProfileId" TEXT NOT NULL,

    CONSTRAINT "MonthlyStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "sellerProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE INDEX "User_telegramId_idx" ON "User"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_userId_key" ON "SellerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_studentId_key" ON "SellerProfile"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_sellerId_key" ON "Shop"("sellerId");

-- CreateIndex
CREATE INDEX "Shop_sellerId_idx" ON "Shop"("sellerId");

-- CreateIndex
CREATE INDEX "Shop_isOpen_idx" ON "Shop"("isOpen");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Product_shopId_idx" ON "Product"("shopId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");

-- CreateIndex
CREATE INDEX "ProductImage_userId_idx" ON "ProductImage"("userId");

-- CreateIndex
CREATE INDEX "ProductImage_phash_idx" ON "ProductImage"("phash");

-- CreateIndex
CREATE INDEX "ProductImage_status_idx" ON "ProductImage"("status");

-- CreateIndex
CREATE INDEX "Report_sellerId_idx" ON "Report"("sellerId");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");

-- CreateIndex
CREATE INDEX "Interaction_sellerProfileId_idx" ON "Interaction"("sellerProfileId");

-- CreateIndex
CREATE INDEX "Interaction_userId_idx" ON "Interaction"("userId");

-- CreateIndex
CREATE INDEX "Interaction_action_idx" ON "Interaction"("action");

-- CreateIndex
CREATE INDEX "Interaction_createdAt_idx" ON "Interaction"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_sellerProfileId_idx" ON "Notification"("sellerProfileId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyStats_sellerProfileId_key" ON "MonthlyStats"("sellerProfileId");

-- CreateIndex
CREATE INDEX "MonthlyStats_month_year_idx" ON "MonthlyStats"("month", "year");

-- CreateIndex
CREATE INDEX "Follow_shopId_idx" ON "Follow"("shopId");

-- CreateIndex
CREATE INDEX "Follow_userId_idx" ON "Follow"("userId");

-- CreateIndex
CREATE INDEX "Follow_createdAt_idx" ON "Follow"("createdAt");

-- CreateIndex
CREATE INDEX "Follow_sellerProfileId_idx" ON "Follow"("sellerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_userId_shopId_key" ON "Follow"("userId", "shopId");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_productId_key" ON "Review"("userId", "productId");

-- AddForeignKey
ALTER TABLE "SellerProfile" ADD CONSTRAINT "SellerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyStats" ADD CONSTRAINT "MonthlyStats_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
