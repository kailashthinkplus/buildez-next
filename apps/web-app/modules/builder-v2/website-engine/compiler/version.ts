/**
 * Immutable Website Compiler version for local compilation plans.
 *
 * @example
 * const version = WEBSITE_COMPILER_VERSION;
 */
export const WEBSITE_COMPILER_VERSION = Object.freeze({
  major: 0,
  minor: 2,
  patch: 0,
  label: "phase-29-compiler-revisit-enrichment",
  toString: () => "0.2.0-phase-29-compiler-revisit-enrichment",
});

/**
 * String form of the local Website Compiler version.
 *
 * @example
 * const version = WEBSITE_COMPILER_VERSION_STRING;
 */
export const WEBSITE_COMPILER_VERSION_STRING = WEBSITE_COMPILER_VERSION.toString();
