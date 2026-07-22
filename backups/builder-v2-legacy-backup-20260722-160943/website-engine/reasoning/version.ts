/**
 * Immutable Reasoning Engine version for deterministic candidate ranking.
 *
 * @example
 * const version = REASONING_ENGINE_VERSION;
 */
export const REASONING_ENGINE_VERSION = Object.freeze({
  major: 0,
  minor: 1,
  patch: 0,
  label: "phase-17-reasoning",
  toString: () => "0.1.0-phase-17-reasoning",
});

/**
 * String form of the local Reasoning Engine version.
 *
 * @example
 * const version = REASONING_ENGINE_VERSION_STRING;
 */
export const REASONING_ENGINE_VERSION_STRING = REASONING_ENGINE_VERSION.toString();
