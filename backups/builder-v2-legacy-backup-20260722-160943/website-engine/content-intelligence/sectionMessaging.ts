import type { ContentFamilyContext, ContentIntelligenceInput, SectionMessagingRole } from "./contentStrategy";

const rolesByFamily: Record<string, SectionMessagingRole[]> = {
  healthcare: [
    { section: "hero", role: "establish care category and trust posture" },
    { section: "services", role: "clarify care scope from provided facts" },
    { section: "proof", role: "show credentials only if provided" },
    { section: "faq", role: "handle appointment, privacy, and service-fit concerns" },
  ],
  real_estate: [
    { section: "hero", role: "establish location and project promise" },
    { section: "details", role: "organize configurations, amenities, and location facts" },
    { section: "proof", role: "show approvals or awards only if provided" },
    { section: "cta", role: "prepare site-visit enquiry path" },
  ],
  food_and_beverage: [
    { section: "hero", role: "set cuisine, ambience, and locality" },
    { section: "menu", role: "surface menu requirements without inventing prices" },
    { section: "locality", role: "clarify address, hours, and service area when known" },
    { section: "cta", role: "prepare reservation or order path" },
  ],
  automotive: [
    { section: "hero", role: "state vehicle/service category and conversion path" },
    { section: "catalogue", role: "organize inventory or services only from facts" },
    { section: "proof", role: "handle authorization, warranty, and reliability proof cautiously" },
    { section: "cta", role: "prepare booking, quote, or test-drive path" },
  ],
  education: [
    { section: "hero", role: "state program category and learner fit" },
    { section: "programs", role: "organize courses, admissions, and delivery facts" },
    { section: "proof", role: "handle outcomes, faculty, and accreditation only if provided" },
    { section: "cta", role: "prepare admissions or enquiry path" },
  ],
  default: [
    { section: "hero", role: "establish business category and audience fit" },
    { section: "offer", role: "organize services or products from known facts" },
    { section: "proof", role: "request proof before using authority claims" },
    { section: "cta", role: "prepare primary conversion path" },
  ],
};

/**
 * Infers section messaging roles for future WebsiteSpec and copy briefs.
 *
 * @example
 * const roles = inferSectionMessagingRoles(input, familyContext);
 */
export function inferSectionMessagingRoles(
  _input: ContentIntelligenceInput,
  familyContext: ContentFamilyContext
): Record<string, string> {
  const roles = rolesByFamily[familyContext.family] ?? rolesByFamily.default;
  return Object.freeze(Object.fromEntries(roles.map((role) => [role.section, role.role])));
}
