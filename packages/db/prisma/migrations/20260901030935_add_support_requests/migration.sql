-- CreateTable
CREATE TABLE "SupportRequest" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SUPPORT',
    "name" TEXT,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "pageUrl" TEXT,
    "severity" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "source" TEXT NOT NULL DEFAULT 'marketing-site',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupportRequest_type_createdAt_idx" ON "SupportRequest"("type", "createdAt");

-- CreateIndex
CREATE INDEX "SupportRequest_status_idx" ON "SupportRequest"("status");
