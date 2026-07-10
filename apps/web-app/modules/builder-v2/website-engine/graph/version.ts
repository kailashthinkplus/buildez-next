/**
 * Immutable Knowledge Graph contract version for local repository-backed indexing.
 *
 * @example
 * const version = WEBSITE_GRAPH_VERSION;
 */
export const WEBSITE_GRAPH_VERSION = Object.freeze({
  major: 0,
  minor: 1,
  patch: 0,
  label: "phase-15-local-index",
  toString: () => "0.1.0-phase-15-local-index",
});

/**
 * String form of the local Knowledge Graph version.
 *
 * @example
 * const version = WEBSITE_GRAPH_VERSION_STRING;
 */
export const WEBSITE_GRAPH_VERSION_STRING = WEBSITE_GRAPH_VERSION.toString();
