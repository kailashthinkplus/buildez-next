import type { CreativeLibraryResult, CreativeRecipe } from "./creativeRecipe";

export type CreativeRecipeValidationResult = Readonly<{ valid: boolean; issues: readonly string[] }>;
const forbiddenTerms = ["<div", "</div>", "className", "react", "css", "html", "buildernode", "premiumwidgetpreview", "screenshot", "jsx", "tsx"];
const fakeClaimTerms = ["#1", "guaranteed", "award-winning", "best in", "certified by", "cure", "100%", "always available"];
export const MINIMUM_CREATIVE_RECIPE_COUNT = 300;
export const MINIMUM_FAMILY_COUNTS: Record<string, number> = Object.freeze({
  hero: 45,
  gallery: 30,
  cta: 25,
  trust: 20,
  proof: 20,
  service: 25,
  product: 25,
  portfolio: 25,
  process: 20,
  faq: 20,
  contact: 20,
  footer: 20,
  testimonial: 20,
  pricing: 15,
  comparison: 15,
  map: 15,
  booking: 15,
  "sticky-action": 10,
  navigation: 15,
  timeline: 10,
  "blog-media": 10,
  team: 10,
});

const metadataFields: Array<keyof CreativeRecipe["metadata"]> = [
  "layoutPattern",
  "gridSystem",
  "visualHierarchy",
  "whitespaceLevel",
  "asymmetryLevel",
  "contentDensity",
  "mediaRatio",
  "imageFraming",
  "typographyRhythm",
  "ctaProminence",
  "motionSuitability",
  "visualComplexity",
  "conversionIntensity",
  "luxuryLevel",
  "editorialLevel",
  "trustLevel",
  "mobilePriority",
  "uniquenessLevers",
];

const fragmentFields: Array<keyof CreativeRecipe["fragments"]> = [
  "layoutFragments",
  "mediaFragments",
  "typographyFragments",
  "spacingFragments",
  "motionFragments",
  "ctaFragments",
  "backgroundFragments",
  "interactionFragments",
];

function familyCounts(recipes: readonly CreativeRecipe[]) {
  return recipes.reduce<Record<string, number>>((counts, recipe) => {
    counts[recipe.family] = (counts[recipe.family] ?? 0) + 1;
    return counts;
  }, {});
}

export function validateCreativeRecipe(recipe: CreativeRecipe): CreativeRecipeValidationResult {
  const issues: string[] = [];
  if (!recipe.id) issues.push("id required");
  if (!/^[A-Z][A-Za-z0-9]+[0-9]{2}$/.test(recipe.id)) issues.push(`${recipe.id}: id must follow PascalCase series naming with a two digit suffix`);
  if (!recipe.version) issues.push(`${recipe.id}: version required`);
  if (!recipe.category) issues.push(`${recipe.id}: category required`);
  if (!recipe.family) issues.push(`${recipe.id}: family required`);
  if (!recipe.editability.primitiveExpansionIntent.length) issues.push(`${recipe.id}: editable primitive expansion intent required`);
  if (!recipe.inspectorHints.length) issues.push(`${recipe.id}: inspector hints required`);
  if (!recipe.responsiveBehavior.desktop.length || !recipe.responsiveBehavior.tablet.length || !recipe.responsiveBehavior.mobile.length) issues.push(`${recipe.id}: responsive behavior required`);
  if (!recipe.requirements.requiredContentFields.length && !recipe.requirements.requiredAssets.length) issues.push(`${recipe.id}: requirements required`);
  for (const field of metadataFields) {
    const value = recipe.metadata[field];
    if (Array.isArray(value) ? !value.length : !value) issues.push(`${recipe.id}: metadata.${field} required`);
  }
  for (const field of fragmentFields) {
    if (!recipe.fragments[field].length) issues.push(`${recipe.id}: fragments.${field} required`);
  }
  const text = JSON.stringify(recipe).toLowerCase();
  if (forbiddenTerms.some((term) => text.includes(term))) issues.push(`${recipe.id}: forbidden output term`);
  if (fakeClaimTerms.some((term) => text.includes(term))) issues.push(`${recipe.id}: fake claim term`);
  if (recipe.compatibility.supportedIndustries.length === 1 && recipe.compatibility.supportedIndustries[0] === "real-estate") issues.push(`${recipe.id}: real estate must not be recipe root`);
  return Object.freeze({ valid: issues.length === 0, issues });
}

export function validateCreativeLibraryResult(result: CreativeLibraryResult): CreativeRecipeValidationResult {
  const ids = new Set<string>();
  const issues: string[] = [];
  const counts = familyCounts(result.catalog);
  for (const recipe of result.catalog) {
    if (ids.has(recipe.id)) issues.push(`duplicate id: ${recipe.id}`);
    ids.add(recipe.id);
    issues.push(...validateCreativeRecipe(recipe).issues);
  }
  if (result.catalog.length < MINIMUM_CREATIVE_RECIPE_COUNT) issues.push(`catalog must contain at least ${MINIMUM_CREATIVE_RECIPE_COUNT} recipes`);
  for (const [family, minimum] of Object.entries(MINIMUM_FAMILY_COUNTS)) {
    if ((counts[family] ?? 0) < minimum) issues.push(`${family}: expected at least ${minimum} recipes`);
  }
  if (!result.selections.length) issues.push("selections required");
  return Object.freeze({ valid: issues.length === 0, issues });
}

export function getCreativeRecipeFamilyCounts(recipes: readonly CreativeRecipe[]): Record<string, number> {
  return Object.freeze(familyCounts(recipes));
}

export function countCreativeRecipesMissingExpandedMetadata(recipes: readonly CreativeRecipe[]): number {
  return recipes.filter((recipe) => !validateCreativeRecipe(recipe).valid).length;
}
