/**
 * Immutable version metadata for the Repair Engine.
 *
 * @example
 * const version = REPAIR_ENGINE_VERSION_STRING;
 */
export const REPAIR_ENGINE_VERSION = Object.freeze({
  module: "repair",
  phase: "PHASE_36_REPAIR_ENGINE",
  version: "36.0.0",
});

/**
 * Stable Repair Engine version string.
 *
 * @example
 * const version = REPAIR_ENGINE_VERSION_STRING;
 */
export const REPAIR_ENGINE_VERSION_STRING = REPAIR_ENGINE_VERSION.version;
