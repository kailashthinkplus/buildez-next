import type { EngineWarning, MissingFact } from "../sdk";
import type { DesignResult } from "../design";
import type { InspirationProfile } from "../inspiration";
import type { MediaStrategy } from "../media-intelligence";
import type { MotionStrategy } from "../motion-intelligence";
import type { VisualMoodProfile } from "../visual-mood";

export type CreativeProviderId =
  | "higgsfield-mcp"
  | "gsap"
  | "framer-motion"
  | "three-js"
  | "spline"
  | "rive"
  | "lottie"
  | "native-motion"
  | "future-provider";

export type CreativeProviderType = "mcp" | "animation" | "three-d" | "interactive" | "native" | "future";
export type CreativeProviderCapability =
  | "cinematic-image-concepts"
  | "media-options"
  | "parallax-reference-ideas"
  | "visual-previews"
  | "motion-implementation-hints"
  | "micro-interaction-hints"
  | "3d-concept-references"
  | "native-motion-mapping"
  | "reference-only";

export type CreativeProviderTaskType = "image" | "video" | "motion" | "3d" | "reference" | "preview" | "other";
export type CreativeProviderOutputType = "reference_only" | "asset_reference" | "motion_spec_reference" | "implementation_hint" | "none";
export type CreativeProviderStatus = "skipped" | "candidate" | "unsupported" | "blocked" | "error";

export type CreativeProviderSafetyPolicy = Readonly<{
  noProviderExecution: true;
  noNetwork: true;
  noMcpCalls: true;
  noGeneratedAssets: true;
  noBuilderNodes: true;
  truthConstraints: string[];
  forbiddenDecisions: string[];
  requiredReviews: string[];
}>;

export type CreativeProviderFallbackPolicy = Readonly<{
  defaultAction: "deterministic_native_strategy";
  ifUnavailable: "use_build_ez_strategy";
  ifUnsafe: "block_provider_task";
  ifUnsupported: "skip_provider";
  notes: string[];
}>;

export type CreativeProviderRecord = Readonly<{
  id: CreativeProviderId;
  version: string;
  type: CreativeProviderType;
  label: string;
  capabilities: CreativeProviderCapability[];
  inert: true;
  executionEnabled: false;
  notes: string[];
}>;

export type CreativeProviderAdapter = Readonly<{
  provider: CreativeProviderRecord;
  canExecute: false;
  execute: never;
}>;

export type CreativeProviderRegistry = Readonly<{ version: string; providers: CreativeProviderRecord[] }>;
export type CreativeProviderWarning = EngineWarning;
export type CreativeProviderMetrics = Readonly<{ providerCount: number; candidateCount: number; warningCount: number }>;

/**
 * Provider-neutral request for bounded future creative execution.
 *
 * @example
 * const request: CreativeProviderRequest = { id: "req", version: "0.1.0", taskType: "reference", requiredOutputType: "reference_only", constraints: [], knownAssets: [], missingAssets: [], safetyPolicy, editabilityRequirements: [], fallbackPolicy };
 */
export type CreativeProviderRequest = Readonly<{
  id: string;
  version: string;
  providerId?: CreativeProviderId;
  taskType: CreativeProviderTaskType;
  requiredOutputType: CreativeProviderOutputType;
  inspirationProfile?: InspirationProfile;
  visualMoodProfile?: VisualMoodProfile;
  mediaStrategy?: MediaStrategy;
  motionStrategy?: MotionStrategy;
  designResult?: DesignResult;
  constraints: string[];
  knownAssets: string[];
  missingAssets: MissingFact[];
  safetyPolicy: CreativeProviderSafetyPolicy;
  editabilityRequirements: string[];
  fallbackPolicy: CreativeProviderFallbackPolicy;
}>;

/**
 * Provider-neutral inert result. This phase never contains generated artifacts.
 *
 * @example
 * const result: CreativeProviderResult = response.data;
 */
export type CreativeProviderResult = Readonly<{
  id: string;
  version: string;
  providerId: CreativeProviderId | "none";
  taskId: string;
  status: CreativeProviderStatus;
  generatedAssetReferences: string[];
  motionSpecReferences: string[];
  warnings: string[];
  limitations: string[];
  confidence: number;
  editabilityImpact: string[];
  providerTraceMetadata: Record<string, string | number | boolean | string[]>;
  conversionToBuilderNativeNotes: string[];
}>;

export type HiggsfieldMcpStrategy = Readonly<{
  id: "higgsfield-mcp-strategy";
  version: string;
  enabled: false;
  providerRole: "optional_execution_provider";
  allowedTasks: string[];
  forbiddenDecisions: string[];
  requiredInputs: string[];
  outputHandling: "convert_to_native_builder_or_reference_only";
  safetyNotes: string[];
}>;
