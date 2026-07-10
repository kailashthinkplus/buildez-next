import type { EngineId, JsonValue } from "./types";
import { compareVersions, type EngineVersionString } from "./version";

/**
 * Deep clones JSON-safe values.
 *
 * @example
 * const copy = deepClone({ id: "spec_1" });
 */
export function deepClone<T extends JsonValue | Record<string, unknown> | unknown[]>(value: T): T {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Recursively freezes an object.
 *
 * @example
 * const frozen = deepFreeze({ stable: true });
 */
export function deepFreeze<T>(value: T): Readonly<T> {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
  }

  return value as Readonly<T>;
}

/**
 * Creates a deterministic-enough non-production placeholder ID.
 *
 * @example
 * const id = createEngineId("spec");
 */
export function createEngineId(prefix = "engine"): EngineId {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}_${random}` as EngineId;
}

/**
 * Creates metadata with SDK timestamp defaults.
 *
 * @example
 * const metadata = createMetadata({ source: "fixture" });
 */
export function createMetadata(metadata: Record<string, JsonValue> = {}): Record<string, JsonValue> {
  return Object.freeze({
    ...metadata,
    sdkCreatedAt: metadata.sdkCreatedAt ?? new Date().toISOString(),
  });
}

/**
 * Returns whether a version is greater than or equal to another version.
 *
 * @example
 * isVersionAtLeast("0.2.0", "0.1.0");
 */
export function isVersionAtLeast(actual: EngineVersionString, minimum: EngineVersionString): boolean {
  return compareVersions(actual, minimum) >= 0;
}

/**
 * Returns true when a value is a plain object.
 *
 * @example
 * isRecord({ ok: true });
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

