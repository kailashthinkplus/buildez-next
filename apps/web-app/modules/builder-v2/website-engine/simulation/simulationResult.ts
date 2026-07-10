import type { EngineSeverity, EngineWarning, JsonValue } from "../sdk";
import type { SIMULATION_ENGINE_VERSION_STRING } from "./version";

export type SimulationWarning = EngineWarning;
export type SimulationIssueCategory = "viewport" | "responsive" | "accessibility" | "seo" | "performance" | "conversion" | "asset" | "editability" | "parity";

export type SimulationIssue = Readonly<{
  id: string;
  category: SimulationIssueCategory;
  severity: EngineSeverity;
  message: string;
  targetId?: string;
  recommendation?: string;
}>;

export type SimulationScore = Readonly<{
  score: number;
  grade: "excellent" | "good" | "needs_attention" | "blocked";
  reasons: string[];
}>;

export type ViewportSimulationResult = Readonly<{
  viewport: "desktop" | "tablet" | "mobile";
  structureScore: number;
  ctaReachable: boolean;
  overflowRisk: number;
  densityRisk: number;
  notes: string[];
}>;

export type ResponsiveSimulationResult = Readonly<{ score: number; hasDesktop: boolean; hasTablet: boolean; hasMobile: boolean; stackingRisk: number; notes: string[] }>;
export type AccessibilitySimulationResult = Readonly<{ score: number; missingAltRisk: number; interactiveLabelRisk: number; reducedMotionCovered: boolean; notes: string[] }>;
export type SEOSimulationResult = Readonly<{ score: number; hasTitleSignal: boolean; hasHeadingSignal: boolean; hasDescriptionSignal: boolean; notes: string[] }>;
export type PerformanceSimulationResult = Readonly<{ score: number; heavyAssetRisk: number; motionRisk: number; nodeCountRisk: number; notes: string[] }>;
export type ConversionSimulationResult = Readonly<{ score: number; aboveFoldCta: boolean; ctaCount: number; frictionRisk: number; notes: string[] }>;
export type AssetSimulationResult = Readonly<{ score: number; requiredAssetCount: number; missingAssetCount: number; readiness: number; notes: string[] }>;
export type EditabilitySimulationResult = Readonly<{ score: number; editableNodeCount: number; totalNodeCount: number; missingInspectorBindingRisk: number; notes: string[] }>;
export type ParitySimulationResult = Readonly<{ score: number; parityReady: boolean; parityIssueCount: number; unsupportedWidgetTypeCount: number; notes: string[] }>;

export type SimulationMetrics = Readonly<{
  issueCount: number;
  warningCount: number;
  recommendationCount: number;
  viewportCount: number;
  missingFactCount: number;
  missingAssetCount: number;
  nodeCount: number;
  rendered: false;
  screenshotCaptured: false;
  sideEffects: false;
}>;

export type SimulationResult = Readonly<{
  id: string;
  version: typeof SIMULATION_ENGINE_VERSION_STRING;
  overallScore: SimulationScore;
  viewportResults: ViewportSimulationResult[];
  responsiveResult: ResponsiveSimulationResult;
  accessibilityResult: AccessibilitySimulationResult;
  seoResult: SEOSimulationResult;
  performanceResult: PerformanceSimulationResult;
  conversionResult: ConversionSimulationResult;
  assetResult: AssetSimulationResult;
  editabilityResult: EditabilitySimulationResult;
  parityResult: ParitySimulationResult;
  issues: SimulationIssue[];
  warnings: SimulationWarning[];
  recommendations: string[];
  metrics: SimulationMetrics;
  trace: string[];
  metadata: Record<string, JsonValue>;
  rendered: false;
  screenshotCaptured: false;
  sideEffects: false;
}>;

export function createSimulationIssue(input: Omit<SimulationIssue, "id"> & { id?: string }): SimulationIssue {
  return Object.freeze({
    id: input.id ?? `simulation.issue.${input.category}.${input.severity}.${input.message.toLowerCase().replace(/[^a-z0-9]+/g, ".").slice(0, 48)}`,
    category: input.category,
    severity: input.severity,
    message: input.message,
    targetId: input.targetId,
    recommendation: input.recommendation,
  });
}
