ALTER TABLE "SiteDomain"
ADD COLUMN "verificationToken" TEXT,
ADD COLUMN "dnsVerifiedAt" TIMESTAMP(3),
ADD COLUMN "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN "lastDnsResult" JSONB,
ADD COLUMN "sslStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN "sslActivatedAt" TIMESTAMP(3),
ADD COLUMN "provider" TEXT;

CREATE UNIQUE INDEX "SiteDomain_verificationToken_key" ON "SiteDomain"("verificationToken");
