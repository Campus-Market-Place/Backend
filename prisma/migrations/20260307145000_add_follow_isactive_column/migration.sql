-- Add Follow.isActive to match schema.prisma and prevent P2022 on follow queries
ALTER TABLE "Follow"
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
