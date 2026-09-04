export type ArtDirectionCompositionStyle = "editorial" | "cinematic" | "minimal" | "luxury" | "bold" | "technical" | "warm" | "premium";
export type ArtDirectionDensity = "open" | "balanced" | "dense";
export type ArtDirectionBreathing = "compact" | "balanced" | "airy";
export type ArtDirectionMediaRhythm = "content-led" | "media-led" | "alternating" | "minimal-media";

/**
 * Executable, renderer-agnostic art direction shared by selection, composition,
 * and Blueprint compilation. It intentionally contains no Builder node data.
 */
export type ArtDirectionBrief = Readonly<{
  version: "1";
  id: string;
  visualPersonality: string;
  compositionStyle: ArtDirectionCompositionStyle;
  componentStrategy: Readonly<{
    preferredTags: readonly string[];
    preferredFamilies: readonly string[];
    discouragedPatterns: readonly string[];
  }>;
  compositionStrategy: Readonly<{
    rhythm: "direct" | "trust-first" | "editorial" | "guided" | "commerce";
    breathing: ArtDirectionBreathing;
    mediaRhythm: ArtDirectionMediaRhythm;
    densityPattern: readonly ArtDirectionDensity[];
    maximumSectionCount: number;
    emphasizeImagery: boolean;
    varySectionWeight: boolean;
  }>;
  blueprintStrategy: Readonly<{
    containerMode: "contained" | "wide" | "framed";
    headingScale: "restrained" | "expressive" | "dramatic";
    sectionContrast: "subtle" | "alternating" | "strong";
    mediaTreatment: "controlled" | "editorial" | "immersive";
    cornerTreatment: "square" | "soft" | "rounded";
  }>;
  antiTemplateRules: readonly string[];
  deterministic: true;
}>;

