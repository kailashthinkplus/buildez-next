-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "scheduledPublishAt" TIMESTAMP(3),
ADD COLUMN     "customCss" TEXT,
ADD COLUMN     "customJs" TEXT;

-- CreateIndex
CREATE INDEX "Page_scheduledPublishAt_idx" ON "Page"("scheduledPublishAt");
