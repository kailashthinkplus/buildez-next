/**
 * Immutable Constraint Engine version for local contract evaluation.
 *
 * @example
 * const version = CONSTRAINT_ENGINE_VERSION;
 */
export const CONSTRAINT_ENGINE_VERSION = Object.freeze({
  major: 0,
  minor: 1,
  patch: 0,
  label: "phase-16-local-evaluation",
  toString: () => "0.1.0-phase-16-local-evaluation",
});

/**
 * String form of the local Constraint Engine version.
 *
 * @example
 * const version = CONSTRAINT_ENGINE_VERSION_STRING;
 */
export const CONSTRAINT_ENGINE_VERSION_STRING = CONSTRAINT_ENGINE_VERSION.toString();
