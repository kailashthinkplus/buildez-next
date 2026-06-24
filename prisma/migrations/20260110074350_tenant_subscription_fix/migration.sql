/*
  Warnings:

  - You are about to drop the column `mandateStatus` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `razorpayCustomerId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `razorpayTokenId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `trialEnds` on the `Subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenantActiveId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_planCode_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_subscriptionId_fkey";

-- DropIndex
DROP INDEX "Subscription_planCode_idx";

-- DropIndex
DROP INDEX "Subscription_tenantId_idx";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "mandateStatus",
DROP COLUMN "paymentMethod",
DROP COLUMN "razorpayCustomerId",
DROP COLUMN "razorpayTokenId",
DROP COLUMN "tenantId",
DROP COLUMN "trialEnds",
ADD COLUMN     "planId" TEXT,
ADD COLUMN     "razorpaySignature" TEXT,
ADD COLUMN     "tenantActiveId" TEXT,
ADD COLUMN     "tenantHistoryId" TEXT,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "planCode" DROP NOT NULL,
ALTER COLUMN "billingCycle" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_tenantActiveId_key" ON "Subscription"("tenantActiveId");

-- CreateIndex
CREATE INDEX "Subscription_tenantHistoryId_idx" ON "Subscription"("tenantHistoryId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_tenantActiveId_fkey" FOREIGN KEY ("tenantActiveId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_tenantHistoryId_fkey" FOREIGN KEY ("tenantHistoryId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
