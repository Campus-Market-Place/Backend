-- CreateEnum
CREATE TYPE "BotState" AS ENUM ('IDLE', 'BROWSING', 'SHOP_VIEW', 'TIMEFRAME_SELECTION', 'STAT_CHECK', 'APPEALING', 'APPEAL_SUMMITED', 'SUPPORT_CONTACT', 'SHOP_INFO', 'TO_BE_SELLER', 'CONTACTING_SELLER');

-- CreateTable
CREATE TABLE "UserState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "state" "BotState" NOT NULL DEFAULT 'IDLE',
    "context" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserState_userId_key" ON "UserState"("userId");

-- AddForeignKey
ALTER TABLE "UserState" ADD CONSTRAINT "UserState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
