-- Add WARNING value to SellerStatus enum if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'SellerStatus'
      AND e.enumlabel = 'WARNING'
  ) THEN
    ALTER TYPE "SellerStatus" ADD VALUE 'WARNING';
  END IF;
END $$;
