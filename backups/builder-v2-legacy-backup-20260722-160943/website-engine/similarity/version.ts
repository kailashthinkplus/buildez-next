/**
 * Immutable version metadata for the Similarity & Diversity Engine.
 *
 * @example
 * const version = SIMILARITY_ENGINE_VERSION_STRING;
 */
export const SIMILARITY_ENGINE_VERSION = Object.freeze({
  module: "similarity",
  phase: "PHASE_35_5_SIMILARITY_DIVERSITY_ENGINE",
  version: "35.5.0",
});

/**
 * Stable version string embedded in Similarity Engine outputs.
 *
 * @example
 * const version = SIMILARITY_ENGINE_VERSION_STRING;
 */
export const SIMILARITY_ENGINE_VERSION_STRING = SIMILARITY_ENGINE_VERSION.version;
