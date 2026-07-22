import { generateNativeBlueprint } from "../generateNativeBlueprint";
import type { V9Workflow } from "./types";

export async function runV9BlueprintAgent(
  workflow: V9Workflow,
  candidateDirective?: Record<string, unknown>
) {
  return generateNativeBlueprint({
    prompt: workflow.prompt,
    pageId: workflow.pageId,
    pageTitle: workflow.pageTitle,
    pageSlug: workflow.pageSlug,
    siteName: workflow.siteName,
    designTokens: workflow.designTokens,
    brandContext: workflow.brandContext,
    brandResolution: workflow.brandResolution,
    research: workflow.research,
    designBrief: workflow.designBrief,
    candidateDirective,
    intent: workflow.intent,
  });
}
