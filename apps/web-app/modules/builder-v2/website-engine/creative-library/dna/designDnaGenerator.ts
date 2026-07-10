import { createEngineWarning } from "../../sdk";
import type { CreativeRecipe } from "../creativeRecipe";
import { DESIGN_DNA_AXES, DESIGN_DNA_VERSION_STRING, type DesignDNA, type DesignDnaInput, type DesignDnaResult, type DesignDnaTrait } from "./designDna";
import { scoreDesignDNA } from "./designDnaScoring";

function hashSeed(parts: readonly string[]) {
  const input = parts.join("|");
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `dna-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function mostCommon(values: readonly string[], fallback: string) {
  const counts = values.reduce<Record<string, number>>((next, value) => {
    if (value) next[value] = (next[value] ?? 0) + 1;
    return next;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? fallback;
}

function axisTrait(axis: DesignDnaTrait["axis"], value: string, source: string, weight = 1): DesignDnaTrait {
  return Object.freeze({ axis, value, source, weight });
}

function fromRecipes(recipes: readonly CreativeRecipe[], picker: (recipe: CreativeRecipe) => string, fallback: string) {
  return mostCommon(recipes.map(picker), fallback);
}

/**
 * Generates deterministic Design DNA from recipe, design, composition, and business metadata.
 *
 * @example
 * const result = generateDesignDNA({ selectedRecipes });
 */
export function generateDesignDNA(input: DesignDnaInput = {}): DesignDnaResult {
  const recipes = input.selectedRecipes ?? [];
  const seed = hashSeed([
    input.businessFamily ?? "unknown",
    input.industry ?? "unknown",
    input.brandTone ?? "unknown",
    input.designResult?.designLanguage.name ?? "design-unknown",
    input.compositionResult?.pageRhythm.rhythm ?? "rhythm-unknown",
    ...recipes.map((recipe) => recipe.id),
  ]);
  const gridSystem = input.designResult?.layoutProfile.grid ?? fromRecipes(recipes, (recipe) => recipe.metadata.gridSystem, "responsive primitive grid");
  const whitespaceLevel = fromRecipes(recipes, (recipe) => recipe.metadata.whitespaceLevel, input.designResult?.densityProfile.level === "airy" ? "spacious" : "balanced");
  const asymmetryLevel = fromRecipes(recipes, (recipe) => recipe.metadata.asymmetryLevel, "subtle");
  const visualHierarchy = fromRecipes(recipes, (recipe) => recipe.metadata.visualHierarchy, "balanced proof and action");
  const typographyRhythm = fromRecipes(recipes, (recipe) => recipe.metadata.typographyRhythm, input.designResult?.typographyProfile.scale ?? "large headline with compact support");
  const mediaRatio = fromRecipes(recipes, (recipe) => recipe.metadata.mediaRatio, "balanced");
  const ctaStyle = fromRecipes(recipes, (recipe) => recipe.metadata.ctaProminence, input.designResult?.interactionProfile.ctaTreatment[0] ?? "standard");
  const traits: DesignDnaTrait[] = [
    axisTrait("gridSystem", gridSystem, "design-or-recipes"),
    axisTrait("whitespaceLevel", whitespaceLevel, "recipes"),
    axisTrait("asymmetryLevel", asymmetryLevel, "recipes"),
    axisTrait("visualHierarchy", visualHierarchy, "recipes"),
    axisTrait("typographyRhythm", typographyRhythm, "design-or-recipes"),
    axisTrait("imageCropStrategy", mediaRatio === "dominant" ? "immersive crop" : "framed crop", "recipes"),
    axisTrait("mediaRatio", mediaRatio, "recipes"),
    axisTrait("cardRatio", recipes.some((recipe) => recipe.family === "product") ? "commerce cards" : "editorial cards", "recipes"),
    axisTrait("radiusSystem", input.designResult?.themeProfile.radius ?? "soft native radius", "design"),
    axisTrait("shadowLanguage", input.designResult?.themeProfile.shadow ?? "subtle elevation", "design"),
    axisTrait("borderLanguage", "quiet structural borders", "creative-library"),
    axisTrait("depthStrategy", mediaRatio === "dominant" ? "layered visual depth" : "flat editorial depth", "recipes"),
    axisTrait("glassUsage", input.designResult?.designLanguage.name === "Technology" ? "selective glass" : "minimal glass", "design"),
    axisTrait("backgroundLanguage", input.designResult?.themeProfile.background[0] ?? "surface bands", "design"),
    axisTrait("ctaStyle", ctaStyle, "recipes"),
    axisTrait("sectionRhythm", input.compositionResult?.pageRhythm.rhythm ?? "guided", "composition"),
    axisTrait("scrollRhythm", input.compositionResult?.scrollNarrative.beats[0] ?? "steady narrative", "composition"),
    axisTrait("motionRhythm", input.designResult?.motionProfile.level ?? "low", "design"),
    axisTrait("editorialLevel", fromRecipes(recipes, (recipe) => recipe.metadata.editorialLevel, "medium"), "recipes"),
    axisTrait("luxuryLevel", fromRecipes(recipes, (recipe) => recipe.metadata.luxuryLevel, "medium"), "recipes"),
    axisTrait("densityLevel", input.designResult?.densityProfile.level ?? fromRecipes(recipes, (recipe) => recipe.metadata.contentDensity, "medium"), "design-or-recipes"),
  ];
  const uniquenessScore = Number(Math.min(1, new Set(traits.map((trait) => trait.value)).size / DESIGN_DNA_AXES.length).toFixed(3));
  const warnings = recipes.length ? [] : [createEngineWarning("DESIGN_DNA_NO_RECIPES", "Design DNA generated without selected recipes.", "creative-library", "minor")];
  const metrics = Object.freeze({ axisCount: DESIGN_DNA_AXES.length, traitCount: traits.length, warningCount: warnings.length, sourceRecipeCount: recipes.length });
  const designDna: DesignDNA = Object.freeze({
    id: `design-dna.${seed}`,
    version: DESIGN_DNA_VERSION_STRING,
    gridSystem,
    whitespaceLevel,
    asymmetryLevel,
    visualHierarchy,
    typographyRhythm,
    imageCropStrategy: traits.find((trait) => trait.axis === "imageCropStrategy")?.value ?? "framed crop",
    mediaRatio,
    cardRatio: traits.find((trait) => trait.axis === "cardRatio")?.value ?? "editorial cards",
    radiusSystem: traits.find((trait) => trait.axis === "radiusSystem")?.value ?? "soft native radius",
    shadowLanguage: traits.find((trait) => trait.axis === "shadowLanguage")?.value ?? "subtle elevation",
    borderLanguage: traits.find((trait) => trait.axis === "borderLanguage")?.value ?? "quiet structural borders",
    depthStrategy: traits.find((trait) => trait.axis === "depthStrategy")?.value ?? "flat editorial depth",
    glassUsage: traits.find((trait) => trait.axis === "glassUsage")?.value ?? "minimal glass",
    backgroundLanguage: traits.find((trait) => trait.axis === "backgroundLanguage")?.value ?? "surface bands",
    ctaStyle,
    sectionRhythm: traits.find((trait) => trait.axis === "sectionRhythm")?.value ?? "guided",
    scrollRhythm: traits.find((trait) => trait.axis === "scrollRhythm")?.value ?? "steady narrative",
    motionRhythm: traits.find((trait) => trait.axis === "motionRhythm")?.value ?? "low",
    editorialLevel: traits.find((trait) => trait.axis === "editorialLevel")?.value ?? "medium",
    luxuryLevel: traits.find((trait) => trait.axis === "luxuryLevel")?.value ?? "medium",
    densityLevel: traits.find((trait) => trait.axis === "densityLevel")?.value ?? "balanced",
    uniquenessScore,
    diversitySeed: seed,
    traits,
    warnings,
    metrics,
  });
  return Object.freeze({ designDna, score: scoreDesignDNA(designDna, input), warnings, metrics, trace: ["design-dna.metadata-only", "deterministic-seed", "no-rendering", "no-provider-calls"] });
}
