-- CreateTable
CREATE TABLE "AiBlueprintSnapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "blueprint" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiBlueprintSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiBlueprintSnapshot_pageId_idx" ON "AiBlueprintSnapshot"("pageId");

-- CreateIndex
CREATE INDEX "AiBlueprintSnapshot_tenantId_siteId_idx" ON "AiBlueprintSnapshot"("tenantId", "siteId");
