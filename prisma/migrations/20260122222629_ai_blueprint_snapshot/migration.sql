-- CreateTable
CREATE TABLE "AIBlueprintSnapshot" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "blueprint" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIBlueprintSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIBlueprintSnapshot_pageId_idx" ON "AIBlueprintSnapshot"("pageId");

-- CreateIndex
CREATE INDEX "AIBlueprintSnapshot_siteId_idx" ON "AIBlueprintSnapshot"("siteId");

-- CreateIndex
CREATE INDEX "AIBlueprintSnapshot_tenantId_idx" ON "AIBlueprintSnapshot"("tenantId");

-- AddForeignKey
ALTER TABLE "AIBlueprintSnapshot" ADD CONSTRAINT "AIBlueprintSnapshot_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIBlueprintSnapshot" ADD CONSTRAINT "AIBlueprintSnapshot_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIBlueprintSnapshot" ADD CONSTRAINT "AIBlueprintSnapshot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
