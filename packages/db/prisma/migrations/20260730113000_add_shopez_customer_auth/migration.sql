ALTER TABLE "ShopCustomer"
ADD COLUMN "passwordHash" TEXT;

CREATE TABLE "ShopCustomerSession" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShopCustomerSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShopCustomerSession_tokenHash_key"
ON "ShopCustomerSession"("tokenHash");

CREATE INDEX "ShopCustomerSession_customerId_idx"
ON "ShopCustomerSession"("customerId");

CREATE INDEX "ShopCustomerSession_expiresAt_idx"
ON "ShopCustomerSession"("expiresAt");

ALTER TABLE "ShopCustomerSession"
ADD CONSTRAINT "ShopCustomerSession_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "ShopCustomer"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
