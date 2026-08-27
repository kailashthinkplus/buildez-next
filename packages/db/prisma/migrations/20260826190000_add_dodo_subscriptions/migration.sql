ALTER TABLE "Subscription"
ADD COLUMN "dodoCustomerId" TEXT,
ADD COLUMN "dodoSubscriptionId" TEXT,
ADD COLUMN "dodoCheckoutSessionId" TEXT,
ADD COLUMN "currentPeriodEnd" TIMESTAMP(3);

CREATE UNIQUE INDEX "Subscription_dodoSubscriptionId_key"
ON "Subscription"("dodoSubscriptionId");

CREATE INDEX "Subscription_dodoCustomerId_idx"
ON "Subscription"("dodoCustomerId");
