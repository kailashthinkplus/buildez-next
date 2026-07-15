import type { BusinessContext } from "../sdk";

export const INTERNAL_PREVIEW_FIXTURE_BUSINESS: BusinessContext = Object.freeze({
  businessName: "BuildEZ Preview Clinic",
  family: "healthcare",
  industryId: "clinic",
  audience: ["local patients"],
  offerings: ["consultations", "preventive care"],
  differentiators: ["clear appointment journey"],
  proofPoints: [],
  knownFacts: { location: "Pune", appointmentMethod: "contact form" },
  missingFacts: [],
});

export const INTERNAL_PREVIEW_FIXTURE_PROMPT =
  "Build a clear, accessible clinic website for local patients with an appointment call to action.";

