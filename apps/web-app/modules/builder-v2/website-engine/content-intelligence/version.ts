import type { EngineVersionString } from "../sdk";

/**
 * Immutable version for the local Content Intelligence Engine contracts.
 *
 * @example
 * const version = CONTENT_INTELLIGENCE_VERSION_STRING;
 */
export const CONTENT_INTELLIGENCE_VERSION_STRING = "0.1.0" as EngineVersionString;

/**
 * Version metadata for trace and documentation consumers.
 *
 * @example
 * const localOnly = CONTENT_INTELLIGENCE_VERSION.localOnly;
 */
export const CONTENT_INTELLIGENCE_VERSION = Object.freeze({
  module: "content-intelligence",
  version: CONTENT_INTELLIGENCE_VERSION_STRING,
  localOnly: true,
});
