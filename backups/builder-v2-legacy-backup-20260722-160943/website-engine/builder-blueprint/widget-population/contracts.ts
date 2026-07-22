import type { NodeType } from "../../../types/blueprint";
import type { ArtDirectionBrief } from "../../creative-director";
import type { BrandIntelligenceProfile, BusinessIntelligenceProfile, ContentStrategy, ExperienceStrategy } from "../../sdk";

export type WidgetPopulationFallbackPolicy = Readonly<{ mode: "reject" | "recommend"; replacementWidget?: NodeType; reason: string }>;
export type ProductionWidgetPopulationContract = Readonly<{
  widgetType: NodeType;
  supportedNarrativeRoles: readonly string[];
  supportedConversionRoles: readonly string[];
  preferredBusinessFamilies: readonly string[];
  disallowedBusinessFamilies: readonly string[];
  requiredProps: readonly string[];
  optionalProps: readonly string[];
  nestedCollections: Readonly<Record<string, readonly string[]>>;
  minimumItems: number;
  maximumItems: number;
  requiredMediaSlots: readonly string[];
  optionalMediaSlots: readonly string[];
  requiredVerifiedFacts: readonly string[];
  editablePropertyPaths: readonly string[];
  hydrationSchema: Readonly<Record<string, "text" | "text-list">>;
  imageAssignmentSchema: Readonly<Record<string, string>>;
  rendererPropShape: readonly string[];
  fallbackPolicy: WidgetPopulationFallbackPolicy;
}>;

export type WidgetPopulationContext = Readonly<{
  businessProfile?: BusinessIntelligenceProfile;
  brandProfile?: BrandIntelligenceProfile;
  contentStrategy?: ContentStrategy;
  experienceStrategy?: ExperienceStrategy;
  artDirectionBrief?: ArtDirectionBrief;
  sectionIntent: Readonly<{ id: string; purpose: string; type: string; patternIds: readonly string[] }>;
  narrativeRole: string;
  conversionRole: string;
  selectedCapability: NodeType;
  selectedWidgetType: NodeType;
  knownFacts: Readonly<Record<string, unknown>>;
  missingFacts: readonly string[];
  availableAssets: readonly string[];
  mediaStrategy?: unknown;
  neighbouringSections: readonly Readonly<{ id: string; purpose: string }>[];
  generationSeed: string | number;
}>;

export type WidgetPopulationDiagnostic = Readonly<{ code: string; severity: "warning" | "error"; path?: string; message: string }>;
export type WidgetPopulationResult = Readonly<{
  ok: boolean;
  widgetType: NodeType;
  props?: Readonly<Record<string, unknown>>;
  style?: Readonly<Record<string, unknown>>;
  diagnostics: readonly WidgetPopulationDiagnostic[];
  replacementRecommendation?: Readonly<{ widgetType: NodeType; reason: string }>;
}>;

export interface WidgetPopulationCompiler {
  readonly widgetType: NodeType;
  compile(context: WidgetPopulationContext, contract: ProductionWidgetPopulationContract): WidgetPopulationResult;
}
