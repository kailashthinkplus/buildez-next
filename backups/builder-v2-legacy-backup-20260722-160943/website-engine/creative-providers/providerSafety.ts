import type { CreativeProviderSafetyPolicy } from "./creativeProvider";

/**
 * Builds a strict no-execution provider safety policy.
 *
 * @example
 * const policy = buildProviderSafetyPolicy();
 */
export function buildProviderSafetyPolicy(extraTruthConstraints: readonly string[] = []): CreativeProviderSafetyPolicy {
  return Object.freeze({
    noProviderExecution: true,
    noNetwork: true,
    noMcpCalls: true,
    noGeneratedAssets: true,
    noBuilderNodes: true,
    truthConstraints: [
      "Providers do not decide business strategy.",
      "Providers do not decide WebsiteSpec.",
      "Providers do not decide sections or final components.",
      "Providers do not bypass constraints, media truth policy, motion accessibility policy, Mapper, Renderer parity, or Critic.",
      ...extraTruthConstraints,
    ],
    forbiddenDecisions: [
      "business strategy",
      "brand strategy",
      "content truth",
      "experience strategy",
      "pattern strategy",
      "WebsiteSpec",
      "section structure",
      "final components",
      "Builder node output",
      "compliance posture",
    ],
    requiredReviews: ["truth policy", "media truth policy", "motion accessibility policy", "editability conversion"],
  });
}
