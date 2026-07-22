import { automotiveGoldenCases } from "./automotive";
import { communityGoldenCases } from "./community";
import { creativeGoldenCases } from "./creative";
import { ecommerceGoldenCases } from "./ecommerce";
import { educationGoldenCases } from "./education";
import { eventsGoldenCases } from "./events";
import { financeGoldenCases } from "./finance";
import { foodHospitalityGoldenCases } from "./food-hospitality";
import { healthcareGoldenCases } from "./healthcare";
import { manufacturingGoldenCases } from "./manufacturing";
import { personalBrandGoldenCases } from "./personal-brand";
import { professionalServicesGoldenCases } from "./professional-services";
import { realEstateGoldenCases } from "./real-estate";
import { saasTechnologyGoldenCases } from "./saas-technology";
import { travelGoldenCases } from "./travel";

export const GOLDEN_WEBSITE_CASES = Object.freeze([
  ...realEstateGoldenCases, ...automotiveGoldenCases, ...healthcareGoldenCases, ...foodHospitalityGoldenCases, ...saasTechnologyGoldenCases, ...educationGoldenCases, ...professionalServicesGoldenCases, ...ecommerceGoldenCases, ...manufacturingGoldenCases, ...travelGoldenCases, ...creativeGoldenCases, ...eventsGoldenCases, ...financeGoldenCases, ...communityGoldenCases, ...personalBrandGoldenCases,
]);

export { createGoldenWebsiteCase } from "./fixtureFactory";
