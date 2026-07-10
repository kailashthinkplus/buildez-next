import { AI_V10_ENABLED } from "../../website-engine/sdk";

export type RunV10WebsiteGenerationInput = {
  pageId: string;
  prompt: string;
  pageTitle?: string;
  siteName?: string;
  context?: Record<string, unknown>;
};

export type RunV10WebsiteGenerationResult = {
  blueprint: never;
  spec: never;
  evaluation: never;
  repairPlan: never;
  trace: never;
  metadata: Record<string, unknown>;
};

export async function runV10WebsiteGeneration(
  _input: RunV10WebsiteGenerationInput
): Promise<RunV10WebsiteGenerationResult> {
  if (!AI_V10_ENABLED) {
    throw new Error("AI v10 is disabled. Phase 11 skeleton is not wired to production generation.");
  }

  throw new Error("AI v10 skeleton has no production generation implementation.");
}

