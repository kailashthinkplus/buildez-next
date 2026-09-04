ALTER TABLE "CrmLead" ADD COLUMN "temperature" TEXT NOT NULL DEFAULT 'WARM';
ALTER TABLE "CrmLead" ADD COLUMN "assignedToId" TEXT;
ALTER TABLE "CrmLead" ADD COLUMN "assignedToName" TEXT;
CREATE TABLE "CrmCommunication" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "direction" TEXT NOT NULL DEFAULT 'OUTBOUND',
  "subject" TEXT,
  "content" TEXT NOT NULL,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CrmCommunication_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CrmCommunication_leadId_createdAt_idx" ON "CrmCommunication"("leadId", "createdAt");
ALTER TABLE "CrmCommunication" ADD CONSTRAINT "CrmCommunication_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "CrmLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
