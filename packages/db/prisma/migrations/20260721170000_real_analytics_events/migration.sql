ALTER TABLE "TrafficEvent"
  ADD COLUMN "city" TEXT,
  ADD COLUMN "sessionId" TEXT,
  ADD COLUMN "eventType" TEXT NOT NULL DEFAULT 'pageview',
  ADD COLUMN "metadata" JSONB;

CREATE INDEX "TrafficEvent_siteId_eventType_createdAt_idx" ON "TrafficEvent"("siteId", "eventType", "createdAt");
CREATE INDEX "TrafficEvent_sessionId_idx" ON "TrafficEvent"("sessionId");
