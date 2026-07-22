/**
 * Immutable Decision Engine version for deterministic strategy selection.
 *
 * @example
 * const version = DECISION_ENGINE_VERSION;
 */
export const DECISION_ENGINE_VERSION = Object.freeze({
  major: 0,
  minor: 1,
  patch: 0,
  label: "phase-18-decision-engine",
  toString: () => "0.1.0-phase-18-decision-engine",
});

/**
 * String form of the local Decision Engine version.
 *
 * @example
 * const version = DECISION_ENGINE_VERSION_STRING;
 */
export const DECISION_ENGINE_VERSION_STRING = DECISION_ENGINE_VERSION.toString();
