/**
 * Immutable WebsiteSpec Builder version.
 *
 * @example
 * const version = WEBSITE_SPEC_BUILDER_VERSION_STRING;
 */
export const WEBSITE_SPEC_BUILDER_VERSION = Object.freeze({
  major: 0,
  minor: 1,
  patch: 0,
  label: "phase-30-website-spec-builder",
  toString: () => "0.1.0-phase-30-website-spec-builder",
});

/**
 * String form of the WebsiteSpec Builder version.
 *
 * @example
 * const version = WEBSITE_SPEC_BUILDER_VERSION_STRING;
 */
export const WEBSITE_SPEC_BUILDER_VERSION_STRING = WEBSITE_SPEC_BUILDER_VERSION.toString();
