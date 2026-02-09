/*
  Warnings:

  - A unique constraint covering the columns `[reporterId]` on the table `Report` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reporterId,shopId]` on the table `Report` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Report_reporterId_key" ON "Report"("reporterId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_reporterId_shopId_key" ON "Report"("reporterId", "shopId");
