/*
  Warnings:

  - A unique constraint covering the columns `[userid,productid]` on the table `Fevorite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Fevorite_userid_productid_key" ON "Fevorite"("userid", "productid");
