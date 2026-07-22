import type { WebsiteSpecBuilderInput } from "./websiteSpec";

/**
 * Builds a deterministic fallback strategy that keeps unknown facts explicit.
 *
 * @example
 * const fallback = buildFallbackStrategy(input);
 */
export function buildFallbackStrategy(input: WebsiteSpecBuilderInput): string {
  const missingCount =
    (input.intent?.missingFacts.length ?? 0) +
    (input.businessProfile?.missingBusinessFacts.length ?? 0) +
    (input.contentStrategy?.missingContentFacts.length ?? 0) +
    (input.mediaStrategy?.missingAssets.length ?? 0);
  if (missingCount > 0) return "Keep missing facts/assets explicit, request them before substitution, and omit unsupported claims.";
  return "Use available upstream metadata only; do not fabricate facts or create rendered output.";
}
