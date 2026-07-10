import type { EngineVersionString } from "../sdk";

/**
 * Immutable version for the local Inspiration Engine contracts.
 *
 * @example
 * const version = INSPIRATION_ENGINE_VERSION_STRING;
 */
export const INSPIRATION_ENGINE_VERSION_STRING = "0.1.0" as EngineVersionString;

/**
 * Version metadata for trace and documentation consumers.
 *
 * @example
 * const localOnly = INSPIRATION_ENGINE_VERSION.localOnly;
 */
export const INSPIRATION_ENGINE_VERSION = Object.freeze({
  module: "inspiration",
  version: INSPIRATION_ENGINE_VERSION_STRING,
  localOnly: true,
});
