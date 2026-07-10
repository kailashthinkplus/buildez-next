import type { EngineVersionString } from "../sdk";

/**
 * Immutable version for the local Experience Engine contracts.
 *
 * @example
 * const version = EXPERIENCE_ENGINE_VERSION_STRING;
 */
export const EXPERIENCE_ENGINE_VERSION_STRING = "0.1.0" as EngineVersionString;

/**
 * Version metadata for trace and documentation consumers.
 *
 * @example
 * const localOnly = EXPERIENCE_ENGINE_VERSION.localOnly;
 */
export const EXPERIENCE_ENGINE_VERSION = Object.freeze({
  module: "experience",
  version: EXPERIENCE_ENGINE_VERSION_STRING,
  localOnly: true,
});
