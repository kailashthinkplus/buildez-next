import type { EngineVersionString } from "./version";

/**
 * Descriptor for an SDK-owned schema.
 *
 * @example
 * const name = SDK_SCHEMAS.WebsiteSpec.name;
 */
export type SchemaDescriptor = Readonly<{
  name: string;
  version: EngineVersionString;
  ownerModule: string;
  stable: boolean;
}>;

/**
 * Immutable schema registry for important SDK contracts.
 *
 * @example
 * const schema = SDK_SCHEMAS.EngineTrace;
 */
export const SDK_SCHEMAS = Object.freeze({
  BusinessContext: Object.freeze({ name: "BusinessContext", version: "0.1.0", ownerModule: "sdk", stable: true }),
  WebsiteIntentClassification: Object.freeze({ name: "WebsiteIntentClassification", version: "0.1.0", ownerModule: "sdk", stable: true }),
  BusinessIntelligenceProfile: Object.freeze({ name: "BusinessIntelligenceProfile", version: "0.1.0", ownerModule: "sdk", stable: true }),
  BrandIntelligenceProfile: Object.freeze({ name: "BrandIntelligenceProfile", version: "0.1.0", ownerModule: "sdk", stable: true }),
  ContentStrategy: Object.freeze({ name: "ContentStrategy", version: "0.1.0", ownerModule: "sdk", stable: true }),
  ExperienceStrategy: Object.freeze({ name: "ExperienceStrategy", version: "0.1.0", ownerModule: "sdk", stable: true }),
  PatternIntelligenceResult: Object.freeze({ name: "PatternIntelligenceResult", version: "0.1.0", ownerModule: "sdk", stable: true }),
  WebsiteSpec: Object.freeze({ name: "WebsiteSpec", version: "0.1.0", ownerModule: "sdk", stable: true }),
  WebsiteDNA: Object.freeze({ name: "WebsiteDNA", version: "0.1.0", ownerModule: "sdk", stable: true }),
  ConstraintRule: Object.freeze({ name: "ConstraintRule", version: "0.1.0", ownerModule: "sdk", stable: true }),
  ResolverResult: Object.freeze({ name: "ResolverResult", version: "0.1.0", ownerModule: "sdk", stable: true }),
  CompiledWebsitePlan: Object.freeze({ name: "CompiledWebsitePlan", version: "0.1.0", ownerModule: "sdk", stable: true }),
  SimulationResult: Object.freeze({ name: "SimulationResult", version: "0.1.0", ownerModule: "sdk", stable: true }),
  EngineTrace: Object.freeze({ name: "EngineTrace", version: "0.1.0", ownerModule: "sdk", stable: true }),
  GenerationDecision: Object.freeze({ name: "GenerationDecision", version: "0.1.0", ownerModule: "sdk", stable: true }),
  GenerationReplay: Object.freeze({ name: "GenerationReplay", version: "0.1.0", ownerModule: "sdk", stable: true }),
  RepairPlan: Object.freeze({ name: "RepairPlan", version: "0.1.0", ownerModule: "sdk", stable: true }),
  GenerationHistory: Object.freeze({ name: "GenerationHistory", version: "0.1.0", ownerModule: "sdk", stable: true }),
} satisfies Record<string, SchemaDescriptor>);

