CREATE TABLE "BillingTransaction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "subscriptionId" TEXT,
    "providerPaymentId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SUBSCRIPTION',
    "status" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "planCode" TEXT,
    "billingCycle" TEXT,
    "paidAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingTransaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BillingTransaction_providerPaymentId_key" ON "BillingTransaction"("providerPaymentId");
CREATE INDEX "BillingTransaction_tenantId_createdAt_idx" ON "BillingTransaction"("tenantId", "createdAt");
CREATE INDEX "BillingTransaction_subscriptionId_idx" ON "BillingTransaction"("subscriptionId");
CREATE INDEX "BillingTransaction_status_idx" ON "BillingTransaction"("status");
