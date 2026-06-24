-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Page_status_idx" ON "Page"("status");
