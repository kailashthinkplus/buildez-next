-- CreateTable
CREATE TABLE "V12GenerationJob" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "state" JSONB,
    "input" JSONB NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "V12GenerationJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "V12GenerationJob_siteId_tenantId_idx" ON "V12GenerationJob"("siteId", "tenantId");

-- CreateIndex
CREATE INDEX "V12GenerationJob_tenantId_createdAt_idx" ON "V12GenerationJob"("tenantId", "createdAt");
