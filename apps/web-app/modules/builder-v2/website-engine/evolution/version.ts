/**
 * Immutable version metadata for Candidate Evolution.
 *
 * @example
 * const version = CANDIDATE_EVOLUTION_VERSION_STRING;
 */
export const CANDIDATE_EVOLUTION_VERSION = Object.freeze({
  module: "evolution",
  phase: "PHASE_35_75_CANDIDATE_EVOLUTION_ENGINE",
  version: "35.75.0",
});

/**
 * Stable version string embedded in evolution outputs.
 *
 * @example
 * const version = CANDIDATE_EVOLUTION_VERSION_STRING;
 */
export const CANDIDATE_EVOLUTION_VERSION_STRING = CANDIDATE_EVOLUTION_VERSION.version;
