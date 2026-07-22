import type { WebsiteDNA } from "../sdk";
import type { WebsiteDNAInput, WebsiteDNAResult } from "./websiteSpec";
import { WEBSITE_SPEC_BUILDER_VERSION_STRING } from "./version";

function unique(values: readonly string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

/**
 * Builds WebsiteDNA identity summaries from upstream intelligence.
 *
 * @example
 * const dna = buildWebsiteDNA({ brandProfile, contentStrategy }).dna;
 */
export function buildWebsiteDNA(input: WebsiteDNAInput): WebsiteDNAResult {
  const dna: WebsiteDNA = Object.freeze({
    id: "website-dna.local",
    version: WEBSITE_SPEC_BUILDER_VERSION_STRING,
    businessProfileRef: input.businessProfile ? String(input.businessProfile.id) : undefined,
    brandProfileRef: input.brandProfile ? String(input.brandProfile.id) : undefined,
    contentStrategyRef: input.contentStrategy ? String(input.contentStrategy.id) : undefined,
    experienceStrategyRef: input.experienceStrategy ? String(input.experienceStrategy.id) : undefined,
    visualIdentity: unique([
      input.brandProfile?.tone ?? "",
      input.brandProfile?.premiumLevel ?? "",
      input.visualMoodProfile?.primaryEmotion ?? "",
      input.designResult?.designLanguage.name ?? "",
      ...(input.inspirationProfile?.selectedInspirationCategories ?? []),
    ]),
    contentIdentity: unique([
      input.contentStrategy?.headlineStrategy ?? "",
      ...(input.contentStrategy?.messageHierarchy ?? []),
      ...(input.contentStrategy?.truthPolicy ?? []),
    ]),
    conversionIdentity: unique([
      ...(input.businessProfile?.conversionGoals ?? []),
      ...(input.contentStrategy?.ctaStrategy ?? []),
      ...(input.experienceStrategy?.ctaCadence ?? []),
    ]),
    interactionIdentity: unique([
      ...(input.experienceStrategy?.interactionRhythm ?? []),
      input.motionStrategy?.motionLanguage ?? "",
      input.motionStrategy?.scrollBehavior.strategy ?? "",
    ]),
    trustIdentity: unique([
      ...(input.businessProfile?.trustSignals ?? []),
      ...(input.contentStrategy?.trustCopyRules ?? []),
      input.brandProfile?.trustPosture ?? "",
    ]),
    localityIdentity: unique([
      ...(input.businessProfile?.localityNeeds ?? []),
      ...(input.contentStrategy?.localityContent ?? []),
    ]),
    assetIdentity: unique([
      ...(input.mediaStrategy?.realAssetRequirements ?? []),
      ...(input.mediaStrategy?.truthPolicy.realAssetRequirements ?? []),
      ...(input.mediaStrategy?.stockRiskWarnings ?? []),
    ]),
    seoIdentity: unique(input.contentStrategy?.seoContentStrategy ?? []),
  });
  return Object.freeze({
    dna,
    explanations: ["WebsiteDNA summarizes business, brand, content, experience, pattern, creative, design, media, and motion identity."],
  });
}
