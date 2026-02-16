-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN     "backIdImagePublicId" TEXT,
ADD COLUMN     "frontIdImagePublicId" TEXT;

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "profileImagePublicId" TEXT,
ADD COLUMN     "profileImageUrl" TEXT;

-- CreateIndex
CREATE INDEX "Fevorite_userid_productid_idx" ON "Fevorite"("userid", "productid");
