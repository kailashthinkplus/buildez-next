import type { JsonValue } from "../sdk";
import type { ShadowComparisonInput } from "./shadowInput";
import type { V9ShadowArtifact } from "./shadowResult";

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" ? value as Record<string, unknown> : undefined;
}

function firstNumber(records: (Record<string, unknown> | undefined)[], keys: string[]): number | undefined {
  for (const record of records) {
    if (!record) continue;
    for (const key of keys) {
      const value = record[key];
      if (typeof value === "number" && Number.isFinite(value)) return value;
    }
  }
  return undefined;
}

function firstBoolean(records: (Record<string, unknown> | undefined)[], keys: string[]): boolean | undefined {
  for (const record of records) {
    if (!record) continue;
    for (const key of keys) {
      const value = record[key];
      if (typeof value === "boolean") return value;
    }
  }
  return undefined;
}

function arrayCount(records: (Record<string, unknown> | undefined)[], keys: string[]): number | undefined {
  for (const record of records) {
    if (!record) continue;
    for (const key of keys) {
      const value = record[key];
      if (Array.isArray(value)) return value.length;
    }
  }
  return undefined;
}

function metadataFor(records: (Record<string, unknown> | undefined)[]): Record<string, JsonValue> {
  const metadata: Record<string, JsonValue> = { metadataOnly: true };
  for (const record of records) {
    if (!record) continue;
    if (typeof record.id === "string") metadata.id = record.id;
    if (typeof record.version === "string") metadata.version = record.version;
  }
  return metadata;
}

/**
 * Adapts provided ai-v9 metadata into a shadow artifact summary.
 *
 * @example
 * const v9 = adaptV9Artifact({ aiV9Artifact: { qualityScore: 70 } });
 */
export function adaptV9Artifact(input: ShadowComparisonInput): V9ShadowArtifact {
  const artifact = asRecord(input.aiV9Artifact);
  const blueprint = asRecord(input.aiV9BlueprintMetadata);
  const output = asRecord(input.aiV9OutputMetadata);
  const records = [artifact, blueprint, output];
  const provided = records.some(Boolean);
  const qualityScore = firstNumber(records, ["qualityScore", "overallScore", "score"]);
  const editabilityScore = firstNumber(records, ["editabilityScore"]);
  const rendererParityScore = firstNumber(records, ["rendererParityScore", "parityScore"]);
  const diversityScore = firstNumber(records, ["diversityScore"]);
  const performanceRisk = firstNumber(records, ["performanceRisk"]);
  const safetyRisk = firstNumber(records, ["safetyRisk", "riskScore"]);
  const repairabilityScore = firstNumber(records, ["repairabilityScore"]);
  const nativeBuilderCompatible = firstBoolean(records, ["nativeBuilderCompatible", "builderCompatible"]);
  const nodeCount = firstNumber(records, ["nodeCount"]) ?? arrayCount(records, ["nodes", "sections"]);
  const warningCount = arrayCount(records, ["warnings"]);
  const issueCount = arrayCount(records, ["issues", "errors"]);
  const missingSignals = [
    !provided ? "ai-v9 artifact metadata" : undefined,
    qualityScore === undefined ? "ai-v9 quality score" : undefined,
    editabilityScore === undefined ? "ai-v9 editability score" : undefined,
    rendererParityScore === undefined ? "ai-v9 renderer parity score" : undefined,
    diversityScore === undefined ? "ai-v9 diversity score" : undefined,
    performanceRisk === undefined ? "ai-v9 performance risk" : undefined,
    safetyRisk === undefined ? "ai-v9 safety risk" : undefined,
    repairabilityScore === undefined ? "ai-v9 repairability score" : undefined,
    nativeBuilderCompatible === undefined ? "ai-v9 native Builder compatibility" : undefined,
  ].filter(Boolean) as string[];

  return Object.freeze({
    id: typeof artifact?.id === "string" ? artifact.id : "shadow.v9.provided-artifact",
    provided,
    source: provided ? "provided" : "missing",
    summary: provided ? "ai-v9 metadata was provided for shadow comparison." : "ai-v9 metadata was not provided; comparison is incomplete.",
    qualityScore,
    editabilityScore,
    rendererParityScore,
    diversityScore,
    performanceRisk,
    safetyRisk,
    repairabilityScore,
    nativeBuilderCompatible,
    nodeCount,
    warningCount,
    issueCount,
    missingSignals,
    metadata: metadataFor(records),
  });
}
