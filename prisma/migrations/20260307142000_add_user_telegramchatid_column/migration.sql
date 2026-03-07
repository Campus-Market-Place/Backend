-- Ensure User.telegramchatId exists and is unique/non-null to match schema.prisma
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "telegramchatId" TEXT;

UPDATE "User"
SET "telegramchatId" = CONCAT('legacy-', "id")
WHERE "telegramchatId" IS NULL OR "telegramchatId" = '';

ALTER TABLE "User"
ALTER COLUMN "telegramchatId" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "User_telegramchatId_key" ON "User"("telegramchatId");
