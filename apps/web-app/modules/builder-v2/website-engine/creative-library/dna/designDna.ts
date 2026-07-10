import type { CompositionResult } from "../../composition";
import type { DesignResult } from "../../design";
import type { EngineWarning } from "../../sdk";
import type { CreativeLibraryInput, CreativeRecipe } from "../creativeRecipe";
import { CREATIVE_LIBRARY_VERSION_STRING } from "../version";

export type DesignDnaAxis =
  | "gridSystem" | "whitespaceLevel" | "asymmetryLevel" | "visualHierarchy" | "typographyRhythm"
  | "imageCropStrategy" | "mediaRatio" | "cardRatio" | "radiusSystem" | "shadowLanguage"
  | "borderLanguage" | "depthStrategy" | "glassUsage" | "backgroundLanguage" | "ctaStyle"
  | "sectionRhythm" | "scrollRhythm" | "motionRhythm" | "editorialLevel" | "luxuryLevel" | "densityLevel";

export type DesignDnaTrait = Readonly<{ axis: DesignDnaAxis; value: string; source: string; weight: number }>;
export type DesignDnaScore = Readonly<{ uniquenessScore: number; diversityScore: number; confidence: number; reasons: string[] }>;
export type DesignDnaWarning = EngineWarning;
export type DesignDnaMetrics = Readonly<{ axisCount: number; traitCount: number; warningCount: number; sourceRecipeCount: number }>;

export type DesignDNA = Readonly<{
  id: string;
  version: string;
  gridSystem: string;
  whitespaceLevel: string;
  asymmetryLevel: string;
  visualHierarchy: string;
  typographyRhythm: string;
  imageCropStrategy: string;
  mediaRatio: string;
  cardRatio: string;
  radiusSystem: string;
  shadowLanguage: string;
  borderLanguage: string;
  depthStrategy: string;
  glassUsage: string;
  backgroundLanguage: string;
  ctaStyle: string;
  sectionRhythm: string;
  scrollRhythm: string;
  motionRhythm: string;
  editorialLevel: string;
  luxuryLevel: string;
  densityLevel: string;
  uniquenessScore: number;
  diversitySeed: string;
  traits: DesignDnaTrait[];
  warnings: DesignDnaWarning[];
  metrics: DesignDnaMetrics;
}>;

export type DesignDnaInput = Readonly<{
  creativeInput?: CreativeLibraryInput;
  selectedRecipes?: readonly CreativeRecipe[];
  designResult?: DesignResult;
  compositionResult?: CompositionResult;
  businessFamily?: string;
  industry?: string;
  brandTone?: string;
}>;

export type DesignDnaResult = Readonly<{ designDna: DesignDNA; score: DesignDnaScore; warnings: DesignDnaWarning[]; metrics: DesignDnaMetrics; trace: string[] }>;

export const DESIGN_DNA_AXES: DesignDnaAxis[] = [
  "gridSystem", "whitespaceLevel", "asymmetryLevel", "visualHierarchy", "typographyRhythm", "imageCropStrategy", "mediaRatio",
  "cardRatio", "radiusSystem", "shadowLanguage", "borderLanguage", "depthStrategy", "glassUsage", "backgroundLanguage",
  "ctaStyle", "sectionRhythm", "scrollRhythm", "motionRhythm", "editorialLevel", "luxuryLevel", "densityLevel",
];

export const DESIGN_DNA_VERSION_STRING = CREATIVE_LIBRARY_VERSION_STRING;
