import type { EngineError, EngineModuleName, EngineSeverity, JsonValue, ValidationIssue } from "./types";

/**
 * Base SDK error class for exceptional SDK misuse.
 *
 * @example
 * throw new EngineSdkError("INVALID_SCHEMA", "Schema is invalid");
 */
export class EngineSdkError extends Error {
  /** Machine-readable error code. */
  readonly code: string;
  /** Module that emitted the error. */
  readonly module?: EngineModuleName;
  /** Whether a caller can recover without crashing the process. */
  readonly recoverable: boolean;
  /** Error severity. */
  readonly severity: EngineSeverity;
  /** JSON-safe metadata for diagnostics. */
  readonly metadata?: Record<string, JsonValue>;

  constructor(
    code: string,
    message: string,
    options: {
      module?: EngineModuleName;
      recoverable?: boolean;
      severity?: EngineSeverity;
      metadata?: Record<string, JsonValue>;
    } = {}
  ) {
    super(message);
    this.name = "EngineSdkError";
    this.code = code;
    this.module = options.module;
    this.recoverable = options.recoverable ?? true;
    this.severity = options.severity ?? "major";
    this.metadata = options.metadata;
  }
}

/**
 * SDK error thrown when validation is intentionally escalated.
 *
 * @example
 * throw new EngineValidationError([{ path: "id", code: "REQUIRED", message: "id is required" }]);
 */
export class EngineValidationError extends EngineSdkError {
  /** Validation issues that caused the error. */
  readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[], module: EngineModuleName = "sdk") {
    super("VALIDATION_FAILED", "Engine SDK validation failed.", {
      module,
      recoverable: true,
      severity: "blocker",
      metadata: { issueCount: issues.length },
    });
    this.name = "EngineValidationError";
    this.issues = issues;
  }
}

/**
 * Creates a normalized EngineError object.
 *
 * @example
 * const error = createEngineError("INVALID_SCHEMA", "Spec is invalid", "sdk");
 */
export function createEngineError(
  code: string,
  message: string,
  module?: EngineModuleName,
  recoverable = true,
  severity: EngineSeverity = "major",
  metadata?: Record<string, JsonValue>
): EngineError {
  return Object.freeze({
    code,
    message,
    module,
    recoverable,
    severity,
    metadata,
  });
}

/**
 * Converts unknown thrown values into a normalized EngineError.
 *
 * @example
 * const error = normalizeEngineError(new Error("Boom"), "sdk");
 */
export function normalizeEngineError(error: unknown, module?: EngineModuleName): EngineError {
  if (error instanceof EngineSdkError) {
    return createEngineError(
      error.code,
      error.message,
      error.module ?? module,
      error.recoverable,
      error.severity,
      error.metadata
    );
  }

  if (error instanceof Error) {
    return createEngineError("UNKNOWN_ERROR", error.message, module, true, "major");
  }

  return createEngineError("UNKNOWN_ERROR", String(error), module, true, "major");
}

