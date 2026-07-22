export const PREMIUM_QUALITY_CATEGORIES = [
  "artDirection",
  "originality",
  "visualHierarchy",
  "typographyQuality",
  "spacingRhythm",
  "compositionQuality",
  "mediaUsage",
  "backgroundTreatment",
  "effectsAndDepth",
  "responsiveComposition",
  "contentQuality",
  "brandAppropriateness",
  "sectionNarrative",
  "conversionClarity",
  "endUserAcceptability",
  "editability",
] as const;
export type PremiumDiagnosticCode =
  | "GENERIC_REPEATED_CARD_PATTERN"
  | "GENERIC_SPLIT_HERO"
  | "LOW_VISUAL_VARIETY"
  | "WEAK_MEDIA_STORYTELLING"
  | "NO_DISTINCTIVE_ART_DIRECTION"
  | "DEFAULT_TAILWIND_APPEARANCE"
  | "SECTION_RHYTHM_TOO_UNIFORM"
  | "PLACEHOLDER_VISUAL_LANGUAGE";
export type SourceDesignQuality = Readonly<{
  status: "scored" | "human-review-required";
  categories: Readonly<
    Record<(typeof PREMIUM_QUALITY_CATEGORIES)[number], number>
  >;
  minimum: number;
  prototypeQuality: boolean;
  endUserAcceptable: boolean;
  premiumLaunchQuality: boolean;
  diagnostics: readonly PremiumDiagnosticCode[];
}>;
export function scoreSourceDesignQuality(
  categories: SourceDesignQuality["categories"],
  diagnostics: readonly PremiumDiagnosticCode[],
): SourceDesignQuality {
  const minimum = Math.min(...Object.values(categories));
  const catastrophic =
    diagnostics.includes("NO_DISTINCTIVE_ART_DIRECTION") ||
    diagnostics.includes("PLACEHOLDER_VISUAL_LANGUAGE");
  const prototypeQuality = !catastrophic && minimum >= 50;
  const endUserAcceptable =
    !catastrophic &&
    minimum >= 75 &&
    categories.artDirection >= 80 &&
    categories.compositionQuality >= 80 &&
    categories.typographyQuality >= 80 &&
    categories.mediaUsage >= 75 &&
    categories.responsiveComposition >= 80;
  const premiumLaunchQuality =
    endUserAcceptable &&
    minimum >= 85 &&
    categories.artDirection >= 90 &&
    categories.originality >= 85 &&
    categories.compositionQuality >= 90 &&
    categories.typographyQuality >= 90 &&
    categories.mediaUsage >= 85 &&
    categories.effectsAndDepth >= 85 &&
    categories.responsiveComposition >= 90 &&
    diagnostics.length === 0;
  return Object.freeze({
    status: "scored",
    categories,
    minimum,
    prototypeQuality,
    endUserAcceptable,
    premiumLaunchQuality,
    diagnostics: Object.freeze([...diagnostics]),
  });
}
export function diagnoseGenericDesign(
  source: string,
): readonly PremiumDiagnosticCode[] {
  const diagnostics: PremiumDiagnosticCode[] = [];
  const articles = (source.match(/<article\b/g) ?? []).length;
  if (articles >= 4) diagnostics.push("GENERIC_REPEATED_CARD_PATTERN");
  if (
    /grid-cols-1[^"']*md:grid-cols-2/.test(source) &&
    /<section[^>]*><div[^>]+grid/.test(source)
  )
    diagnostics.push("GENERIC_SPLIT_HERO");
  const media = (source.match(/data-media-role/g) ?? []).length;
  if (media < 2) diagnostics.push("WEAK_MEDIA_STORYTELLING");
  const sections = (source.match(/<section\b/g) ?? []).length;
  if (sections < 3) diagnostics.push("LOW_VISUAL_VARIETY");
  if (
    !/(absolute|gradient|shadow|opacity|overlap|-[mp][trblxy]?-[0-9])/.test(
      source,
    )
  )
    diagnostics.push("DEFAULT_TAILWIND_APPEARANCE");
  return Object.freeze(diagnostics);
}
export const pendingHumanQuality = (): SourceDesignQuality =>
  Object.freeze({
    status: "human-review-required",
    categories: Object.freeze(
      Object.fromEntries(
        PREMIUM_QUALITY_CATEGORIES.map((category) => [category, 0]),
      ) as any,
    ),
    minimum: 0,
    prototypeQuality: false,
    endUserAcceptable: false,
    premiumLaunchQuality: false,
    diagnostics: Object.freeze([]),
  });
