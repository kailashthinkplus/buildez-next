import { CREATIVE_LIBRARY_VERSION_STRING } from "../version";
import type { CreativeFragment, CreativeFragmentFamily } from "./creativeFragment";
import { MINIMUM_FRAGMENT_FAMILY_COUNTS } from "./fragmentFamilies";

const familyPurpose: Record<CreativeFragmentFamily, string> = {
  layout: "Vary section structure without changing strategy.",
  grid: "Vary grid rhythm and column behavior.",
  spacing: "Vary spacing cadence across breakpoints.",
  typography: "Vary type rhythm and hierarchy.",
  background: "Vary background language and surface treatment.",
  media: "Vary media framing without generating assets.",
  cta: "Vary call-to-action treatment.",
  motion: "Vary motion suitability metadata.",
  interaction: "Vary interaction affordance metadata.",
  scroll: "Vary scroll rhythm metadata.",
  card: "Vary card proportions and grouping.",
  navigation: "Vary navigation structure metadata.",
  proof: "Vary trust/proof presentation safely.",
  form: "Vary form layout and consent metadata.",
  footer: "Vary closure and footer metadata.",
  responsive: "Vary responsive stacking strategy.",
  accessibility: "Vary accessibility guardrails.",
};

const recipeFamilies = ["hero", "gallery", "cta", "trust", "proof", "service", "product", "portfolio", "process", "faq", "contact", "footer", "navigation", "testimonial", "pricing", "comparison", "timeline", "blog-media", "team", "map", "booking", "sticky-action"] as const;

function pascal(value: string) {
  return value.split(/[-_]/g).map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join("");
}

function pad(index: number) {
  return String(index).padStart(2, "0");
}

function fragmentFor(family: CreativeFragmentFamily, index: number): CreativeFragment {
  const recipeOffset = index % recipeFamilies.length;
  return Object.freeze({
    id: `Fragment${pascal(family)}${pad(index)}`,
    family,
    category: family,
    purpose: `${familyPurpose[family]} Variant ${pad(index)}.`,
    compatibility: {
      supportedRecipeFamilies: [recipeFamilies[recipeOffset], recipeFamilies[(recipeOffset + 3) % recipeFamilies.length], recipeFamilies[(recipeOffset + 7) % recipeFamilies.length]],
      supportedDesignLanguages: ["Minimal", "Modern", "Premium", "Editorial", "Luxury", "Clinical", "Hospitality", "Technology", "Warm", "Architectural"],
      supportedVisualMoods: ["calm", "trustworthy", "luxurious", "elegant", "energetic", "technical", "inspiring", "warm", "precise"],
      supportedIndustries: ["healthcare", "real-estate", "restaurant", "education", "automotive", "hospitality", "interior-design", "d2c", "technology-saas", "professional-services"],
      dnaAxes: [family, index % 2 === 0 ? "visualHierarchy" : "whitespaceLevel", index % 3 === 0 ? "mediaRatio" : "gridSystem"],
    },
    requirements: {
      requiredRecipeFields: ["id", "family", "metadata", "fragments"],
      requiredAssets: family === "media" ? ["provided media asset"] : [],
      requiredFacts: family === "proof" ? ["provided proof fact"] : [],
    },
    assemblyRules: [
      { rule: `${family}.metadata-merge.${pad(index)}`, target: "metadata", effect: "Add fragment metadata to recipe assembly plan only.", codeGenerated: false as const },
      { rule: `${family}.composition-note.${pad(index)}`, target: "composition", effect: "Influence future composition without emitting UI.", codeGenerated: false as const },
    ],
    editabilityImpact: ["Preserve primitive editability.", "Expose future inspector intent only."],
    inspectorHints: [`${family} fragment should map to existing native property paths later.`],
    responsiveBehavior: ["desktop metadata only", "tablet reduce complexity", "mobile keep action and content readable"],
    accessibilityNotes: ["Do not encode visual-only meaning.", "Keep missing content explicit."],
    conflicts: [],
    fallbacks: ["Skip fragment if required metadata is missing."],
    version: CREATIVE_LIBRARY_VERSION_STRING,
    status: "stable",
  });
}

/**
 * Builds the metadata-only Creative Fragment catalog.
 *
 * @example
 * const fragments = buildFragmentCatalog();
 */
export function buildFragmentCatalog(): CreativeFragment[] {
  return Object.entries(MINIMUM_FRAGMENT_FAMILY_COUNTS).flatMap(([family, count]) =>
    Array.from({ length: count }, (_, index) => fragmentFor(family as CreativeFragmentFamily, index + 1))
  );
}
