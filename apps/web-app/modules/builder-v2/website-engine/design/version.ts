import type { EngineVersionString } from "../sdk";

/**
 * Immutable version for the local Design Engine contracts.
 *
 * @example
 * const version = DESIGN_ENGINE_VERSION_STRING;
 */
export const DESIGN_ENGINE_VERSION_STRING = "0.1.0" as EngineVersionString;

/**
 * Version metadata for trace and documentation consumers.
 *
 * @example
 * const localOnly = DESIGN_ENGINE_VERSION.localOnly;
 */
export const DESIGN_ENGINE_VERSION = Object.freeze({
  module: "design",
  version: DESIGN_ENGINE_VERSION_STRING,
  localOnly: true,
});
