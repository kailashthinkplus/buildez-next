/**
 * Immutable Native Builder Mapper contract version.
 *
 * @example
 * const version = NATIVE_BUILDER_MAPPER_VERSION_STRING;
 */
export const NATIVE_BUILDER_MAPPER_VERSION = Object.freeze({
  major: 0,
  minor: 1,
  patch: 0,
  label: "phase-31-native-builder-mapper-contracts",
  toString: () => "0.1.0-phase-31-native-builder-mapper-contracts",
});

/**
 * String form of the Native Builder Mapper contract version.
 *
 * @example
 * const version = NATIVE_BUILDER_MAPPER_VERSION_STRING;
 */
export const NATIVE_BUILDER_MAPPER_VERSION_STRING = NATIVE_BUILDER_MAPPER_VERSION.toString();
