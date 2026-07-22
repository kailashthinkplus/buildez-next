import type { EngineVersionString } from "../sdk";

/**
 * Immutable version for the local Pattern Intelligence Engine contracts.
 *
 * @example
 * const version = PATTERN_INTELLIGENCE_VERSION_STRING;
 */
export const PATTERN_INTELLIGENCE_VERSION_STRING = "0.1.0" as EngineVersionString;

/**
 * Version metadata for trace and documentation consumers.
 *
 * @example
 * const localOnly = PATTERN_INTELLIGENCE_VERSION.localOnly;
 */
export const PATTERN_INTELLIGENCE_VERSION = Object.freeze({
  module: "pattern-intelligence",
  version: PATTERN_INTELLIGENCE_VERSION_STRING,
  localOnly: true,
});
