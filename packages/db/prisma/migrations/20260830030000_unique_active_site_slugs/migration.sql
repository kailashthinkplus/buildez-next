-- Public site URLs use the site slug without an internal database id.
-- Soft-deleted historical rows may retain an old slug, but active sites may not collide.
DO $$
DECLARE
  duplicate_site RECORD;
  base_slug TEXT;
  candidate_slug TEXT;
  suffix_number INTEGER;
BEGIN
  FOR duplicate_site IN
    SELECT id, name
    FROM (
      SELECT id, name, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY "createdAt", id) AS duplicate_number
      FROM "Site"
      WHERE "deletedAt" IS NULL
    ) ranked_sites
    WHERE duplicate_number > 1
  LOOP
    base_slug := TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(duplicate_site.name), '[^a-z0-9]+', '-', 'g'));
    IF base_slug = '' THEN base_slug := 'website'; END IF;
    base_slug := LEFT(base_slug, 80);
    candidate_slug := base_slug;
    suffix_number := 2;

    WHILE EXISTS (
      SELECT 1 FROM "Site"
      WHERE slug = candidate_slug AND "deletedAt" IS NULL AND id <> duplicate_site.id
    ) LOOP
      candidate_slug := LEFT(base_slug, 80 - LENGTH('-' || suffix_number::TEXT)) || '-' || suffix_number::TEXT;
      suffix_number := suffix_number + 1;
    END LOOP;

    UPDATE "Site" SET slug = candidate_slug WHERE id = duplicate_site.id;
  END LOOP;
END $$;

CREATE UNIQUE INDEX "Site_active_slug_key"
ON "Site"("slug")
WHERE "deletedAt" IS NULL;
