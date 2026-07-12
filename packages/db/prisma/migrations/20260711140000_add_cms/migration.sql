CREATE TABLE "CmsCollection" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "icon" TEXT DEFAULT 'database',
  "fields" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CmsCollection_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "CmsEntry" (
  "id" TEXT NOT NULL,
  "collectionId" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CmsEntry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CmsCollection_siteId_slug_key" ON "CmsCollection"("siteId", "slug");
CREATE INDEX "CmsCollection_siteId_idx" ON "CmsCollection"("siteId");
CREATE INDEX "CmsEntry_collectionId_idx" ON "CmsEntry"("collectionId");
CREATE INDEX "CmsEntry_status_idx" ON "CmsEntry"("status");
ALTER TABLE "CmsCollection" ADD CONSTRAINT "CmsCollection_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CmsEntry" ADD CONSTRAINT "CmsEntry_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "CmsCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
