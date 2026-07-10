import type { CandidateMutation, CandidateMutationKind, CandidateProfile } from "./candidateVariants";

function cycle(values: string[], fallback: string, index: number): string {
  const source = values.length ? values : [fallback];
  return source[index % source.length] ?? fallback;
}

/**
 * Mutates a candidate profile metadata field without changing upstream inputs.
 *
 * @example
 * const profile = mutateCandidate(baseProfile, "layout-rhythm", 1);
 */
export function mutateCandidate(profile: CandidateProfile, kind: CandidateMutationKind, index: number): CandidateProfile {
  const similarityProfile = profile.similarityProfile;
  const mutationId = `mutation.${profile.id}.${kind}.${index}`;
  const before = beforeValues(similarityProfile, kind);
  const after = afterValues(kind, before, index);
  const mutation: CandidateMutation = Object.freeze({
    id: mutationId,
    kind,
    description: `Deterministically vary ${kind}.`,
    before,
    after,
  });
  const nextSimilarityProfile = Object.freeze({
    ...similarityProfile,
    recipeIds: kind === "hero-recipe" ? [cycle(after, "hero.variant", index), ...similarityProfile.recipeIds.filter((id) => !id.includes("hero"))] : similarityProfile.recipeIds,
    recipeFamilies: kind === "recipe-family" ? [...new Set([...after, ...similarityProfile.recipeFamilies])] : similarityProfile.recipeFamilies,
    heroRecipeId: kind === "hero-recipe" ? cycle(after, "hero.variant", index) : similarityProfile.heroRecipeId,
    fragmentFamilies: kind === "fragment-selection" ? [...new Set([...after, ...similarityProfile.fragmentFamilies])] : similarityProfile.fragmentFamilies,
    designDnaAxes: kind === "design-dna-weighting" || kind === "grid-philosophy" || kind === "asymmetry-level"
      ? Object.freeze({ ...similarityProfile.designDnaAxes, [axisForKind(kind)]: cycle(after, kind, index) })
      : similarityProfile.designDnaAxes,
    typographyRhythm: kind === "typography-rhythm" ? after : similarityProfile.typographyRhythm,
    layoutRhythm: kind === "layout-rhythm" || kind === "spacing-rhythm" || kind === "grid-philosophy" ? after : similarityProfile.layoutRhythm,
    motionRhythm: kind === "motion-rhythm" ? after : similarityProfile.motionRhythm,
    ctaCadence: kind === "cta-cadence" ? after : similarityProfile.ctaCadence,
    sectionSequence: kind === "composition-ordering" ? [...similarityProfile.sectionSequence].reverse() : similarityProfile.sectionSequence,
    visualDensity: kind === "visual-density" ? after : similarityProfile.visualDensity,
    metadata: Object.freeze({ ...similarityProfile.metadata, [`mutation.${kind}`]: after.join("|") }),
  });
  return Object.freeze({
    ...profile,
    id: `${profile.id}.${kind}.${index}`,
    similarityProfile: nextSimilarityProfile,
    mutations: [...profile.mutations, mutation],
  });
}

function beforeValues(profile: CandidateProfile["similarityProfile"], kind: CandidateMutationKind): string[] {
  if (kind === "hero-recipe") return profile.heroRecipeId ? [profile.heroRecipeId] : [];
  if (kind === "recipe-family") return profile.recipeFamilies;
  if (kind === "fragment-selection") return profile.fragmentFamilies;
  if (kind === "typography-rhythm") return profile.typographyRhythm;
  if (kind === "layout-rhythm" || kind === "spacing-rhythm" || kind === "grid-philosophy") return profile.layoutRhythm;
  if (kind === "motion-rhythm") return profile.motionRhythm;
  if (kind === "cta-cadence") return profile.ctaCadence;
  if (kind === "composition-ordering") return profile.sectionSequence;
  if (kind === "visual-density") return profile.visualDensity;
  if (kind === "asymmetry-level") return [profile.designDnaAxes.asymmetryLevel ?? ""].filter(Boolean);
  return Object.values(profile.designDnaAxes);
}

function afterValues(kind: CandidateMutationKind, before: readonly string[], index: number): string[] {
  const catalogs: Record<CandidateMutationKind, string[]> = {
    "hero-recipe": ["hero.editorial-split", "hero.trust-led", "hero.product-story", "hero.cinematic", "hero.conversion-direct"],
    "recipe-family": ["proof", "trust", "process", "gallery", "cta"],
    "fragment-selection": ["layout", "typography", "spacing", "motion", "cta"],
    "design-dna-weighting": ["trust-forward", "editorial-forward", "conversion-forward", "product-forward", "clarity-forward"],
    "typography-rhythm": ["editorial-serif", "technical-sans", "warm-humanist", "premium-display", "dense-informational"],
    "spacing-rhythm": ["compact", "balanced", "airy", "expansive", "alternating"],
    "layout-rhythm": ["direct", "trust-first", "editorial", "guided", "commerce"],
    "motion-rhythm": ["minimal", "editorial", "staggered", "static-first", "cinematic-lite"],
    "cta-cadence": ["early-cta", "proof-before-cta", "repeat-2", "final-cta", "sticky-action"],
    "composition-ordering": ["hero", "proof", "offer", "details", "cta"],
    "visual-density": ["minimal", "balanced", "rich", "dense", "open-to-dense"],
    "media-strategy": ["real-assets-first", "gallery-led", "proof-led", "product-led", "map-led"],
    "grid-philosophy": ["modular", "editorial", "asymmetric", "centered", "split"],
    "asymmetry-level": ["none", "subtle", "moderate", "high", "alternating"],
  };
  const catalog = catalogs[kind];
  const chosen = [catalog[index % catalog.length] ?? catalog[0], catalog[(index + 2) % catalog.length] ?? catalog[0]];
  return chosen.filter((value) => !before.includes(value));
}

function axisForKind(kind: CandidateMutationKind): string {
  if (kind === "grid-philosophy") return "gridSystem";
  if (kind === "asymmetry-level") return "asymmetryLevel";
  return "visualHierarchy";
}
