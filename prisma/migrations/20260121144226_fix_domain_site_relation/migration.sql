/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,key,periodStart]` on the table `PlanUsage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PlanUsage_tenantId_key_key";

-- AlterTable
ALTER TABLE "PlanUsage" ADD COLUMN     "periodEnd" TIMESTAMP(3),
ADD COLUMN     "periodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "aiSuspended" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SiteLayout" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "header" JSONB,
    "footer" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteLayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteLayout_siteId_key" ON "SiteLayout"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_hostname_key" ON "Domain"("hostname");

-- CreateIndex
CREATE UNIQUE INDEX "PlanUsage_tenantId_key_periodStart_key" ON "PlanUsage"("tenantId", "key", "periodStart");

-- AddForeignKey
ALTER TABLE "SiteLayout" ADD CONSTRAINT "SiteLayout_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
