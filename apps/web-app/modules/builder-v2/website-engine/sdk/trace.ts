import type {
  EngineError,
  EngineMetrics,
  EngineModuleName,
  EngineResult,
  EngineStatus,
  EngineTrace,
  EngineWarning,
  GenerationDecision,
  JsonValue,
} from "./types";
import { ENGINE_VERSIONS } from "./version";
import { createEngineId, createMetadata } from "./utils";

/**
 * Input for creating an EngineTrace.
 *
 * @example
 * const trace = createEngineTrace({ module: "sdk", stage: "validation" });
 */
export type CreateEngineTraceInput = {
  module: EngineModuleName;
  stage: string;
  startedAt?: string;
  completedAt?: string;
  warnings?: EngineWarning[];
  errors?: EngineError[];
  decisions?: GenerationDecision[];
  repositoryRecordsUsed?: string[];
  constraintsApplied?: string[];
  confidence?: number;
  metadata?: Record<string, JsonValue>;
};

/**
 * Creates a complete trace object for a module stage.
 *
 * @example
 * const trace = createEngineTrace({ module: "resolver", stage: "select" });
 */
export function createEngineTrace(input: CreateEngineTraceInput | EngineModuleName, stage?: string, warnings: EngineWarning[] = []): EngineTrace {
  const normalizedInput: CreateEngineTraceInput =
    typeof input === "string"
      ? { module: input, stage: stage ?? "execute", warnings }
      : input;
  const startedAt = normalizedInput.startedAt ?? new Date().toISOString();
  const completedAt = normalizedInput.completedAt ?? new Date().toISOString();
  const durationMs = Math.max(0, Date.parse(completedAt) - Date.parse(startedAt));
  const metrics: EngineMetrics = Object.freeze({
    startedAt,
    completedAt,
    durationMs,
  });

  return Object.freeze({
    traceId: createEngineId("trace"),
    module: normalizedInput.module,
    stage: normalizedInput.stage,
    startedAt,
    completedAt,
    versions: ENGINE_VERSIONS,
    version: ENGINE_VERSIONS,
    warnings: normalizedInput.warnings ?? [],
    errors: normalizedInput.errors ?? [],
    decisions: normalizedInput.decisions ?? [],
    metrics,
    repositoryRecordsUsed: normalizedInput.repositoryRecordsUsed ?? [],
    constraintsApplied: normalizedInput.constraintsApplied ?? [],
    confidence: normalizedInput.confidence,
    metadata: normalizedInput.metadata ?? {},
  });
}

/**
 * Creates a standardized skeleton warning.
 *
 * @example
 * const warning = skeletonWarning("planner");
 */
export function skeletonWarning(module: EngineModuleName): EngineWarning {
  return Object.freeze({
    code: "WEBSITE_ENGINE_SKELETON_ONLY",
    message: `${module} is a skeleton only and does not perform generation.`,
    module,
    severity: "info",
  });
}

/**
 * Creates a normalized engine warning.
 *
 * @example
 * const warning = createEngineWarning("MISSING_FACT", "Location missing", "sdk");
 */
export function createEngineWarning(
  code: string,
  message: string,
  module?: EngineModuleName,
  severity: EngineWarning["severity"] = "minor",
  metadata?: Record<string, JsonValue>
): EngineWarning {
  return Object.freeze({ code, message, module, severity, metadata });
}

/**
 * Creates a normalized EngineResult.
 *
 * @example
 * const result = createEngineResult({ module: "sdk", stage: "validation", data: true });
 */
export function createEngineResult<T>(input: {
  module: EngineModuleName;
  stage: string;
  data: T;
  status?: EngineStatus;
  warnings?: EngineWarning[];
  errors?: EngineError[];
  decisions?: GenerationDecision[];
  metadata?: Record<string, JsonValue>;
  confidence?: number;
}): EngineResult<T> {
  const warnings = input.warnings ?? [];
  const errors = input.errors ?? [];
  const status = input.status ?? (errors.length ? "error" : warnings.length ? "warning" : "ok");
  const trace = createEngineTrace({
    module: input.module,
    stage: input.stage,
    warnings,
    errors,
    decisions: input.decisions,
    confidence: input.confidence,
    metadata: input.metadata,
  });

  return Object.freeze({
    status,
    ok: status === "ok" || status === "warning",
    data: input.data,
    warnings,
    errors,
    trace,
    metrics: trace.metrics,
    metadata: createMetadata(input.metadata),
  });
}

/**
 * Creates an EngineResult for skeleton-only modules.
 *
 * @example
 * const result = createSkeletonResult("resolver", { selected: [] });
 */
export function createSkeletonResult<T>(module: EngineModuleName, data: T): EngineResult<T> {
  const warning = skeletonWarning(module);

  return createEngineResult({
    module,
    stage: "skeleton",
    data,
    status: "warning",
    warnings: [warning],
    metadata: { skeleton: true },
  });
}

