-- Speeds up the analytics dashboard's main query (siteId + createdAt range,
-- ordered by createdAt), which previously had no matching index and likely
-- fell back to a broader scan.
CREATE INDEX "TrafficEvent_siteId_createdAt_idx" ON "TrafficEvent"("siteId", "createdAt");
