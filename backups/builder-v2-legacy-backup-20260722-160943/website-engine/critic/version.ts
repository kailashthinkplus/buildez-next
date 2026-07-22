/**
 * Immutable version metadata for the metadata-only Critic Engine.
 *
 * @example
 * const version = CRITIC_ENGINE_VERSION_STRING;
 */
export const CRITIC_ENGINE_VERSION = Object.freeze({
  module: "critic",
  phase: "PHASE_35_CRITIC_ENGINE",
  version: "35.0.0",
});

/**
 * Stable version string embedded in critic outputs.
 *
 * @example
 * const resultVersion = CRITIC_ENGINE_VERSION_STRING;
 */
export const CRITIC_ENGINE_VERSION_STRING = CRITIC_ENGINE_VERSION.version;
