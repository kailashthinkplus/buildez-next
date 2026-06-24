-- CreateEnum
CREATE TYPE "AIConversationPhase" AS ENUM ('INTERVIEW', 'READY', 'GENERATING', 'DONE');

-- AlterTable
ALTER TABLE "AIConversation" ADD COLUMN     "context" JSONB,
ADD COLUMN     "phase" "AIConversationPhase" NOT NULL DEFAULT 'INTERVIEW';
