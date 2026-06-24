/*
  AI Conversation + Message schema fix
  FINAL — Postgres + Prisma shadow DB safe
*/

-- -----------------------------------------------------
-- 1️⃣ Drop old unique constraint (page-only)
-- -----------------------------------------------------
DROP INDEX IF EXISTS "AIConversation_pageId_key";

-- -----------------------------------------------------
-- 2️⃣ Add columns as NULLABLE first (required for shadow DB)
-- -----------------------------------------------------
ALTER TABLE "AIConversation"
ADD COLUMN IF NOT EXISTS "tenantId" TEXT,
ADD COLUMN IF NOT EXISTS "siteId" TEXT,
ADD COLUMN IF NOT EXISTS "createdBy" TEXT;

-- -----------------------------------------------------
-- 3️⃣ Backfill tenantId + siteId (CORRECT JOIN PATH)
-- -----------------------------------------------------
UPDATE "AIConversation" c
SET
  "siteId" = p."siteId",
  "tenantId" = s."tenantId"
FROM "Page" p
JOIN "Site" s ON s.id = p."siteId"
WHERE c."pageId" = p.id
  AND (c."siteId" IS NULL OR c."tenantId" IS NULL);

-- -----------------------------------------------------
-- 4️⃣ Enforce NOT NULL after backfill
-- -----------------------------------------------------
ALTER TABLE "AIConversation"
ALTER COLUMN "siteId" SET NOT NULL,
ALTER COLUMN "tenantId" SET NOT NULL;

-- -----------------------------------------------------
-- 5️⃣ Indexes
-- -----------------------------------------------------
CREATE INDEX IF NOT EXISTS "AIConversation_tenantId_idx"
  ON "AIConversation"("tenantId");

CREATE INDEX IF NOT EXISTS "AIConversation_siteId_idx"
  ON "AIConversation"("siteId");

CREATE INDEX IF NOT EXISTS "AIConversation_pageId_idx"
  ON "AIConversation"("pageId");

-- -----------------------------------------------------
-- 6️⃣ Composite uniqueness (tenant + site + page)
-- -----------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS
  "AIConversation_tenantId_siteId_pageId_key"
ON "AIConversation"("tenantId", "siteId", "pageId");

-- -----------------------------------------------------
-- 7️⃣ Foreign keys (guarded for re-run safety)
-- -----------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'AIConversation_tenantId_fkey'
  ) THEN
    ALTER TABLE "AIConversation"
    ADD CONSTRAINT "AIConversation_tenantId_fkey"
    FOREIGN KEY ("tenantId")
    REFERENCES "Tenant"(id)
    ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'AIConversation_siteId_fkey'
  ) THEN
    ALTER TABLE "AIConversation"
    ADD CONSTRAINT "AIConversation_siteId_fkey"
    FOREIGN KEY ("siteId")
    REFERENCES "Site"(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- -----------------------------------------------------
-- 8️⃣ AIMessage fixes
-- -----------------------------------------------------
ALTER TABLE "AIMessage"
ADD COLUMN IF NOT EXISTS "createdBy" TEXT;

ALTER TABLE "AIMessage"
ALTER COLUMN "content" TYPE JSONB
USING jsonb_build_object('text', "content");

-- -----------------------------------------------------
-- 9️⃣ Drop obsolete legacy table
-- -----------------------------------------------------
DROP TABLE IF EXISTS "AiBlueprintSnapshot";
