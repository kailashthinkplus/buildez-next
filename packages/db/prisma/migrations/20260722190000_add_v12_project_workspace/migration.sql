CREATE TABLE "V12Project" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "currentRevision" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "V12Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "V12ProjectFile" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "V12ProjectFile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "V12ProjectRevision" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "operations" JSONB NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "V12ProjectRevision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "V12ProjectCheckpoint" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "label" TEXT,
    "snapshot" JSONB NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "V12ProjectCheckpoint_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "V12Project_siteId_key" ON "V12Project"("siteId");
CREATE INDEX "V12Project_tenantId_idx" ON "V12Project"("tenantId");
CREATE UNIQUE INDEX "V12ProjectFile_projectId_path_key" ON "V12ProjectFile"("projectId", "path");
CREATE INDEX "V12ProjectFile_projectId_revision_idx" ON "V12ProjectFile"("projectId", "revision");
CREATE UNIQUE INDEX "V12ProjectRevision_projectId_sequence_key" ON "V12ProjectRevision"("projectId", "sequence");
CREATE INDEX "V12ProjectRevision_projectId_createdAt_idx" ON "V12ProjectRevision"("projectId", "createdAt");
CREATE INDEX "V12ProjectCheckpoint_projectId_createdAt_idx" ON "V12ProjectCheckpoint"("projectId", "createdAt");
CREATE INDEX "V12ProjectCheckpoint_revisionId_idx" ON "V12ProjectCheckpoint"("revisionId");

ALTER TABLE "V12Project" ADD CONSTRAINT "V12Project_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "V12Project" ADD CONSTRAINT "V12Project_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "V12ProjectFile" ADD CONSTRAINT "V12ProjectFile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "V12Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "V12ProjectRevision" ADD CONSTRAINT "V12ProjectRevision_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "V12Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "V12ProjectCheckpoint" ADD CONSTRAINT "V12ProjectCheckpoint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "V12Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "V12ProjectCheckpoint" ADD CONSTRAINT "V12ProjectCheckpoint_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "V12ProjectRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
