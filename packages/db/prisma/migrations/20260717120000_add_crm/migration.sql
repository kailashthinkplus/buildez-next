CREATE TABLE "CrmLead" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "company" TEXT,
  "message" TEXT,
  "source" TEXT NOT NULL DEFAULT 'manual',
  "sourceUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "score" INTEGER NOT NULL DEFAULT 0,
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "customData" JSONB,
  "notes" TEXT,
  "consent" BOOLEAN NOT NULL DEFAULT false,
  "lastContactedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CrmLead_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "CrmApiKey" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "keyPrefix" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "lastUsedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "CrmApiKey_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CrmApiKey_keyHash_key" ON "CrmApiKey"("keyHash");
CREATE INDEX "CrmLead_siteId_createdAt_idx" ON "CrmLead"("siteId", "createdAt");
CREATE INDEX "CrmLead_siteId_status_idx" ON "CrmLead"("siteId", "status");
CREATE INDEX "CrmLead_siteId_email_idx" ON "CrmLead"("siteId", "email");
CREATE INDEX "CrmApiKey_siteId_idx" ON "CrmApiKey"("siteId");
ALTER TABLE "CrmLead" ADD CONSTRAINT "CrmLead_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrmApiKey" ADD CONSTRAINT "CrmApiKey_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
