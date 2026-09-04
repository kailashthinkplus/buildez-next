import type { PremiumFixture } from "./schema";
const candidate = (
  fixtureId: string,
  industry: string,
  category: PremiumFixture["category"],
  designGrammar: string,
  asset: string,
): PremiumFixture =>
  Object.freeze({
    fixtureId,
    industry,
    category,
    designGrammar,
    sourceFile: `premium/${fixtureId}.tsx`,
    asset: `/v11-premium/${asset}.png`,
    approval: Object.freeze({
      state: "authored-candidate",
      approvedAsGoldStandard: false,
      approvedBy: null,
      approvalDate: null,
      notes: "Awaiting independent human visual review.",
      knownCompromises: Object.freeze([]),
    }),
  });
export const PREMIUM_FIXTURES = Object.freeze([
  candidate(
    "solstice-residences",
    "Luxury real estate",
    "luxury-real-estate",
    "cinematic full-bleed residence, offset editorial ledger, overlapping property dossier",
    "real-estate",
  ),
  candidate(
    "field-form-studio",
    "Architecture",
    "architecture-studio",
    "asymmetric project index, oversized typography, offset crop sequence",
    "architecture",
  ),
  candidate(
    "lattice-ai",
    "AI software",
    "ai-saas",
    "workflow stage with floating telemetry, unequal bento hierarchy, dark luminous depth",
    "ai-saas",
  ),
  candidate(
    "meridian-capital",
    "Fintech",
    "fintech",
    "dense financial command surface, trust ledger, editorial proof ribbon",
    "fintech",
  ),
  candidate(
    "isla-noma",
    "Hospitality",
    "hospitality-resort",
    "cinematic destination prologue, staggered travelogue, booking folio overlap",
    "resort",
  ),
  candidate(
    "arc-one",
    "Automotive",
    "automotive",
    "full-bleed motion campaign, specification rail, layered performance chapters",
    "automotive",
  ),
  candidate(
    "nocturne-edition",
    "Fashion",
    "fashion-editorial",
    "magazine cover composition, vertical type rail, asymmetric campaign sequence",
    "fashion",
  ),
  candidate(
    "counterform",
    "Creative services",
    "creative-agency",
    "collage hero, controlled paper overlap, alternating portfolio silhouettes",
    "agency",
  ),
  candidate(
    "atelier-health",
    "Healthcare",
    "healthcare-clinic",
    "calm architectural trust field, practitioner pathway, floating appointment panel",
    "clinic",
  ),
  candidate(
    "aurelia-one",
    "Luxury ecommerce",
    "luxury-ecommerce",
    "museum product stage, material macro sequence, floating purchase dossier",
    "product",
  ),
] as const);
export const isApprovedGoldStandard = (fixture: PremiumFixture) =>
  fixture.approval.approvedAsGoldStandard &&
  fixture.approval.state === "approved-gold-standard" &&
  Boolean(fixture.approval.approvedBy && fixture.approval.approvalDate);
