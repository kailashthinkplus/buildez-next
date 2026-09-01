-- CreateTable
CREATE TABLE "WebsiteFeedback" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "pageId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebsiteFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebsiteFeedback_siteId_createdAt_idx" ON "WebsiteFeedback"("siteId", "createdAt");

-- CreateIndex
CREATE INDEX "WebsiteFeedback_status_idx" ON "WebsiteFeedback"("status");

-- AddForeignKey
ALTER TABLE "WebsiteFeedback" ADD CONSTRAINT "WebsiteFeedback_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
