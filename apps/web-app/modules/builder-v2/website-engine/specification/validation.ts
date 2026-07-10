import type { WebsiteSpecBuilderResult, WebsiteSpecBuilderValidationResult, WebsiteSpecValidationIssue } from "./websiteSpec";

const fakeClaimTerms = ["award-winning", "guaranteed results", "officially authorized", "number one", "#1"];
const forbiddenOutputTerms = ["builderNode", "reactElement", "className=", "<div", "</div>", "style={", "function component"];

function issue(path: string, message: string, code = "INVALID_WEBSITE_SPEC_BUILDER_RESULT"): WebsiteSpecValidationIssue {
  return Object.freeze({ path, message, code });
}

function containsTerm(value: unknown, terms: readonly string[]) {
  const text = JSON.stringify(value).toLowerCase();
  return terms.some((term) => text.includes(term.toLowerCase()));
}

/**
 * Validates WebsiteSpec Builder output.
 *
 * @example
 * const validation = validateWebsiteSpecBuilderResult(result);
 */
export function validateWebsiteSpecBuilderResult(result: WebsiteSpecBuilderResult): WebsiteSpecBuilderValidationResult {
  const issues: WebsiteSpecValidationIssue[] = [];
  const spec = result.websiteSpec;
  if (!spec.id) issues.push(issue("websiteSpec.id", "WebsiteSpec id is required.", "REQUIRED"));
  if (!spec.version) issues.push(issue("websiteSpec.version", "WebsiteSpec version is required.", "REQUIRED"));
  if (!result.websiteDNA.id) issues.push(issue("websiteDNA.id", "WebsiteDNA id is required.", "REQUIRED"));
  if (!result.websiteDNA.version) issues.push(issue("websiteDNA.version", "WebsiteDNA version is required.", "REQUIRED"));
  if (!spec.business) issues.push(issue("websiteSpec.business", "Business context is required or must be warned.", "REQUIRED"));
  if (!spec.archetype && !result.warnings.some((warning) => warning.message.toLowerCase().includes("archetype"))) {
    issues.push(issue("websiteSpec.archetype", "Archetype is required or must be warned.", "REQUIRED"));
  }
  if (!spec.goals.primaryGoal && !result.warnings.some((warning) => warning.message.toLowerCase().includes("goal"))) {
    issues.push(issue("websiteSpec.goals.primaryGoal", "Primary goal is required or must be warned.", "REQUIRED"));
  }
  if (result.contentRequirements.length === 0) issues.push(issue("contentRequirements", "Content requirements must be explicit.", "REQUIRED"));
  if (result.componentPreferences.length === 0) issues.push(issue("componentPreferences", "Component preferences must be explicit.", "REQUIRED"));
  if (result.assetRequirements.length === 0) issues.push(issue("assetRequirements", "Asset requirements must be explicit.", "REQUIRED"));
  if (result.seoRequirements.length === 0) issues.push(issue("seoRequirements", "SEO requirements must be explicit.", "REQUIRED"));
  if (result.accessibilityRequirements.length === 0) issues.push(issue("accessibilityRequirements", "Accessibility requirements must be explicit.", "REQUIRED"));
  if (result.conversionRules.length === 0) issues.push(issue("conversionRules", "Conversion rules must be explicit.", "REQUIRED"));
  if (result.responsiveRules.length === 0) issues.push(issue("responsiveRules", "Responsive rules must be explicit.", "REQUIRED"));
  if (!Array.isArray(result.factsUsed) || !Array.isArray(result.missingFacts)) {
    issues.push(issue("facts", "Facts used and missing facts must be explicit arrays.", "REQUIRED"));
  }
  if (spec.sections.length === 0 && result.componentPreferences.length > 0) {
    issues.push(issue("websiteSpec.sections", "Sections should exist when enough component/pattern inputs exist.", "REQUIRED"));
  }
  if (containsTerm(result, fakeClaimTerms)) issues.push(issue("result", "WebsiteSpec Builder output appears to contain fake business fact language.", "FAKE_FACT"));
  if (containsTerm(result, forbiddenOutputTerms)) issues.push(issue("result", "WebsiteSpec Builder output must not contain Builder node, HTML, React, CSS, or JS output.", "FORBIDDEN_OUTPUT"));
  if (result.trace.length === 0) issues.push(issue("trace", "Trace metadata is required.", "REQUIRED"));
  return Object.freeze({ valid: issues.length === 0, issues });
}
