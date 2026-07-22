import type { CriticInput } from "./criticInput";
import { createCategoryResult, hardFailure, metadataIssue, repairRecommendation } from "./criticScoring";
import type { CriticCategoryResult } from "./criticResult";

function safeCorpus(input: CriticInput): string {
  const textParts = [
    input.compiledPlan?.missingFacts.join(" "),
    input.compiledPlan?.constraintViolations.join(" "),
    input.mediaStrategy?.truthPolicy.rules.join(" "),
    input.mediaStrategy?.stockRiskWarnings.join(" "),
    input.contentStrategy ? JSON.stringify(input.contentStrategy) : "",
    input.knownFacts ? JSON.stringify(input.knownFacts) : "",
    (input.missingFacts ?? []).map((fact) => typeof fact === "string" ? fact : `${fact.id} ${fact.label ?? ""}`).join(" "),
  ];
  return textParts.filter(Boolean).join(" ").toLowerCase();
}

/**
 * Evaluates truth safety, unsupported claims, placeholder copy, and missing facts.
 *
 * @example
 * const result = runContentTruthCritic({ compiledPlan, mediaStrategy });
 */
export function runContentTruthCritic(input: CriticInput): CriticCategoryResult {
  const corpus = safeCorpus(input);
  const hardFailures = [];
  const issues = [];
  const recommendations = [];
  const missingFactCount = (input.compiledPlan?.missingFacts.length ?? 0) + (input.missingFacts?.length ?? 0);

  const hardChecks: Array<[string, string, RegExp, string]> = [
    ["FAKE_STATS", "Fake or unsupported statistics are present.", /\bfake stats?\b|\bunsupported stats?\b|\binvented stats?\b/i, "Remove unsupported statistics or mark them as missing facts."],
    ["FAKE_COMPLIANCE_CLAIMS", "Fake compliance, certification, or privacy claims are present.", /\bfake compliance\b|\bfabricated certification\b|\bunsupported compliance\b/i, "Only keep compliance claims when provided and verified."],
    ["FAKE_AWARDS", "Fake award claims are present.", /\bfake awards?\b|\bfabricated awards?\b|\bunsupported awards?\b/i, "Remove awards unless source facts are provided."],
    ["FAKE_TESTIMONIALS", "Fake testimonial claims are present.", /\bfake testimonials?\b|\bfabricated testimonials?\b|\bplaceholder testimonials?\b/i, "Remove testimonials unless real testimonial facts are provided."],
    ["FAKE_PRICING", "Fake pricing claims are present.", /\bfake pricing\b|\bfabricated pricing\b|\bunsupported pricing\b/i, "Remove prices unless provided by source facts."],
    ["PLACEHOLDER_COPY", "Placeholder copy remains in metadata.", /\blorem ipsum\b|\bplaceholder copy\b|\btodo copy\b|\breplace me\b/i, "Replace placeholder copy or preserve it as a missing content fact."],
  ];

  for (const [code, message, pattern, repairHint] of hardChecks) {
    if (pattern.test(corpus)) hardFailures.push(hardFailure("content-truth", code, message, repairHint));
  }
  if (missingFactCount > 0) {
    issues.push(metadataIssue("content-truth", "minor", "Missing facts remain explicit.", "Keep missing facts explicit and avoid substituting invented facts."));
  }
  if (hardFailures.length > 0) {
    recommendations.push(repairRecommendation("content-truth", "critical", "Repair truth violations before publish.", "Strip unsupported claims and request missing source facts."));
  }

  return createCategoryResult("content-truth", 94 - missingFactCount * 2, [
    `Missing fact count: ${missingFactCount}.`,
    "Content truth critic scanned metadata only, not rendered copy.",
  ], issues, hardFailures, recommendations, 1.2);
}
