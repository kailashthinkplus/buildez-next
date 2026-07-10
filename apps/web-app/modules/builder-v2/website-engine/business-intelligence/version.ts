import type { EngineVersionString } from "../sdk";

/**
 * Immutable version for the local Business Intelligence Engine contracts.
 *
 * @example
 * const version = BUSINESS_INTELLIGENCE_VERSION_STRING;
 */
export const BUSINESS_INTELLIGENCE_VERSION_STRING = "0.1.0" as EngineVersionString;

/**
 * Version metadata for trace and documentation consumers.
 *
 * @example
 * const moduleName = BUSINESS_INTELLIGENCE_VERSION.module;
 */
export const BUSINESS_INTELLIGENCE_VERSION = Object.freeze({
  module: "business-intelligence",
  version: BUSINESS_INTELLIGENCE_VERSION_STRING,
  localOnly: true,
});
