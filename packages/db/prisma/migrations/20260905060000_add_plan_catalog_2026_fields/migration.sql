-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "catalogVersion" TEXT,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "eyebrow" TEXT,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "trialDays" INTEGER;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "trialEndsAt" TIMESTAMP(3);
