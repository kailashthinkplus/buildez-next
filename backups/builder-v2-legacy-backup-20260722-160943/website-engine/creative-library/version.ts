/**
 * Immutable Creative Library version.
 *
 * @example
 * const version = CREATIVE_LIBRARY_VERSION_STRING;
 */
export const CREATIVE_LIBRARY_VERSION = Object.freeze({
  major: 0,
  minor: 1,
  patch: 0,
  label: "phase-31a-creative-library",
  toString: () => "0.1.0-phase-31a-creative-library",
});

/**
 * String form of the Creative Library version.
 *
 * @example
 * const version = CREATIVE_LIBRARY_VERSION_STRING;
 */
export const CREATIVE_LIBRARY_VERSION_STRING = CREATIVE_LIBRARY_VERSION.toString();
