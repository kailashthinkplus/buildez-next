-- CreateTable
CREATE TABLE "SiteIntegration" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "appSlug" TEXT NOT NULL,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteIntegration_siteId_idx" ON "SiteIntegration"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteIntegration_siteId_appSlug_key" ON "SiteIntegration"("siteId", "appSlug");

-- AddForeignKey
ALTER TABLE "SiteIntegration" ADD CONSTRAINT "SiteIntegration_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

