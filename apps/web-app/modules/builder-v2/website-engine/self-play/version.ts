/**
 * Immutable version metadata for Self-Play Optimization.
 *
 * @example
 * const version = SELF_PLAY_VERSION_STRING;
 */
export const SELF_PLAY_VERSION = Object.freeze({
  module: "self-play",
  phase: "PHASE_36_5_SELF_PLAY_OPTIMIZATION_ENGINE",
  version: "36.5.0",
});

/**
 * Stable Self-Play version string.
 *
 * @example
 * const version = SELF_PLAY_VERSION_STRING;
 */
export const SELF_PLAY_VERSION_STRING = SELF_PLAY_VERSION.version;
