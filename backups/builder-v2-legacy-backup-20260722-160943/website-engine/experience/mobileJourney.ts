import type { ExperienceFamilyContext, ExperienceInput, MobileJourney } from "./experienceStrategy";

const mobileByFamily: Record<string, MobileJourney> = {
  healthcare: ["appointment action reachable early", "trust and credentials before form", "short mobile form path"],
  real_estate: ["location/project promise first", "site-visit CTA reachable early", "availability/compliance caution before conversion"],
  food_and_beverage: ["menu and reservation/order reachable immediately", "hours/location surfaced early", "short booking path"],
  automotive: ["services/inventory surfaced early", "quote/booking/test-drive CTA reachable", "terms caution before commitment"],
  education: ["program clarity early", "admissions/enquiry reachable", "parent/student objections handled before form"],
  ecommerce_d2c: ["product value immediately", "purchase path reachable", "shipping/returns near action if known"],
  hospitality: ["stay experience and booking reachable early", "amenities/location before booking", "availability caution"],
  architecture_interiors: ["portfolio visible early", "consultation CTA reachable", "process/proof before form"],
  unknown: ["primary action reachable early", "trust before form", "short mobile path"],
};

/**
 * Infers mobile journey requirements.
 *
 * @example
 * const mobile = inferMobileJourney(input, familyContext);
 */
export function inferMobileJourney(_input: ExperienceInput, familyContext: ExperienceFamilyContext): MobileJourney {
  return mobileByFamily[familyContext.family] ?? mobileByFamily.unknown;
}
