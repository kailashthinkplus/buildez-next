-- CreateTable
CREATE TABLE "AiCreditReservation" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "siteId" TEXT,
    "planCode" TEXT,
    "amount" INTEGER NOT NULL,
    "planCreditsReserved" INTEGER NOT NULL DEFAULT 0,
    "topUpCreditsReserved" INTEGER NOT NULL DEFAULT 0,
    "planUsageId" TEXT,
    "topUpUsageId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RESERVED',
    "releaseReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "capturedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),

    CONSTRAINT "AiCreditReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiCreditLedgerEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "reservationId" TEXT,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "planCredits" INTEGER NOT NULL DEFAULT 0,
    "topUpCredits" INTEGER NOT NULL DEFAULT 0,
    "planCode" TEXT,
    "reason" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiCreditLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiCreditReservation_reservationId_key" ON "AiCreditReservation"("reservationId");

-- CreateIndex
CREATE INDEX "AiCreditReservation_tenantId_idx" ON "AiCreditReservation"("tenantId");

-- CreateIndex
CREATE INDEX "AiCreditReservation_tenantId_status_idx" ON "AiCreditReservation"("tenantId", "status");

-- CreateIndex
CREATE INDEX "AiCreditReservation_createdAt_idx" ON "AiCreditReservation"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiCreditLedgerEntry_idempotencyKey_key" ON "AiCreditLedgerEntry"("idempotencyKey");

-- CreateIndex
CREATE INDEX "AiCreditLedgerEntry_tenantId_idx" ON "AiCreditLedgerEntry"("tenantId");

-- CreateIndex
CREATE INDEX "AiCreditLedgerEntry_reservationId_idx" ON "AiCreditLedgerEntry"("reservationId");

-- CreateIndex
CREATE INDEX "AiCreditLedgerEntry_tenantId_createdAt_idx" ON "AiCreditLedgerEntry"("tenantId", "createdAt");

-- AddForeignKey
ALTER TABLE "AiCreditReservation" ADD CONSTRAINT "AiCreditReservation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiCreditLedgerEntry" ADD CONSTRAINT "AiCreditLedgerEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiCreditLedgerEntry" ADD CONSTRAINT "AiCreditLedgerEntry_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "AiCreditReservation"("reservationId") ON DELETE SET NULL ON UPDATE CASCADE;
