import type { ExperienceFamilyContext, ExperienceInput, TrustCurve } from "./experienceStrategy";

/**
 * Infers trust curve from business trust signals, brand posture, and content truth rules.
 *
 * @example
 * const curve = inferTrustCurve(input, familyContext);
 */
export function inferTrustCurve(input: ExperienceInput, familyContext: ExperienceFamilyContext): TrustCurve {
  const trustSignals = input.businessProfile?.trustSignals ?? [];
  const brandTrust = input.brandProfile?.trustPosture;
  const truthRules = input.contentStrategy?.truthPolicy?.slice(0, 3) ?? [];
  const familyTrust =
    familyContext.family === "healthcare"
      ? ["credentials before appointment CTA", "reduce medical anxiety"]
      : familyContext.family === "real_estate"
        ? ["location and compliance proof before repeated site-visit CTA"]
        : familyContext.family === "food_and_beverage"
          ? ["menu and operational clarity before reservation/order CTA"]
          : familyContext.family === "automotive"
            ? ["reliability and terms clarity before quote/test-drive CTA"]
            : familyContext.family === "education"
              ? ["program clarity and evidence-safe proof before admissions CTA"]
              : ["truth policy before conversion pressure"];

  return [...new Set([...(brandTrust ? [`brand trust posture: ${brandTrust}`] : []), ...familyTrust, ...trustSignals, ...truthRules])];
}
