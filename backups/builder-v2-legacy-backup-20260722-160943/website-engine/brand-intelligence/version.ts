import type { EngineVersionString } from "../sdk";

/**
 * Immutable version for the local Brand Intelligence Engine contracts.
 *
 * @example
 * const version = BRAND_INTELLIGENCE_VERSION_STRING;
 */
export const BRAND_INTELLIGENCE_VERSION_STRING = "0.1.0" as EngineVersionString;

/**
 * Version metadata for trace and documentation consumers.
 *
 * @example
 * const localOnly = BRAND_INTELLIGENCE_VERSION.localOnly;
 */
export const BRAND_INTELLIGENCE_VERSION = Object.freeze({
  module: "brand-intelligence",
  version: BRAND_INTELLIGENCE_VERSION_STRING,
  localOnly: true,
});
