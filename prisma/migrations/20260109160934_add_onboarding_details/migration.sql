-- DropIndex
DROP INDEX "UserOnboarding_accountType_idx";

-- DropIndex
DROP INDEX "UserOnboarding_completed_idx";

-- DropIndex
DROP INDEX "UserOnboarding_primaryUseCase_idx";

-- AlterTable
ALTER TABLE "UserOnboarding" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "profession" TEXT,
ADD COLUMN     "website" TEXT;
