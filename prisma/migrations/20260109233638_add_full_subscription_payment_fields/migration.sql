-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "amountPaid" INTEGER,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT,
ADD COLUMN     "startedAt" TIMESTAMP(3);
