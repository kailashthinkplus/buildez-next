-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "aiAgentFollowupLimitPerHour" INTEGER NOT NULL DEFAULT 40,
ADD COLUMN     "aiAgentRunLimitPerHour" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "builderAgentLimitPerHour" INTEGER NOT NULL DEFAULT 30;

