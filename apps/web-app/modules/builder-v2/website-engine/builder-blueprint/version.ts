/**
 * Immutable Builder Blueprint Engine version.
 *
 * @example
 * const version = BUILDER_BLUEPRINT_ENGINE_VERSION_STRING;
 */
export const BUILDER_BLUEPRINT_ENGINE_VERSION = Object.freeze({
  major: 0,
  minor: 1,
  patch: 1,
  label: "phase-30-6-native-builder-alignment",
  toString: () => "0.1.1-phase-30-6-native-builder-alignment",
});

/**
 * String form of the Builder Blueprint Engine version.
 *
 * @example
 * const version = BUILDER_BLUEPRINT_ENGINE_VERSION_STRING;
 */
export const BUILDER_BLUEPRINT_ENGINE_VERSION_STRING = BUILDER_BLUEPRINT_ENGINE_VERSION.toString();
