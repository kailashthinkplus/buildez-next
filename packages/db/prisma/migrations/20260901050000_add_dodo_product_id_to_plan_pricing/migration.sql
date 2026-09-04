-- AlterTable
ALTER TABLE "PlanPricing" ADD COLUMN     "dodoProductId" TEXT;

-- CreateIndex
CREATE INDEX "PlanPricing_dodoProductId_idx" ON "PlanPricing"("dodoProductId");
