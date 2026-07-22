/**
 * Semantic-ish version string used by Website Engine SDK contracts.
 *
 * @example
 * const version: EngineVersionString = "0.1.0";
 */
export type EngineVersionString = `${number}.${number}.${number}` | `${number}.${number}.${number}-${string}`;

/**
 * Stable version map for every Website Engine subsystem that participates in traces.
 *
 * @example
 * const sdkVersion = ENGINE_VERSIONS.sdk;
 */
export type EngineVersions = Readonly<{
  sdk: EngineVersionString;
  specification: EngineVersionString;
  repository: EngineVersionString;
  graph: EngineVersionString;
  compiler: EngineVersionString;
  resolver: EngineVersionString;
  mapper: EngineVersionString;
  renderer: EngineVersionString;
  critic: EngineVersionString;
  repair: EngineVersionString;
  learning: EngineVersionString;
}>;

/**
 * Backward-compatible alias used by Phase 11 skeleton stubs.
 *
 * @example
 * function acceptsVersion(version: EngineVersion) { return version.sdk; }
 */
export type EngineVersion = EngineVersions;

/**
 * Immutable version constants for the Website Engine foundation.
 *
 * @example
 * const traceVersion = ENGINE_VERSIONS.sdk;
 */
export const ENGINE_VERSIONS: EngineVersions = Object.freeze({
  sdk: "0.1.0",
  specification: "0.1.0",
  repository: "0.1.0",
  graph: "0.1.0",
  compiler: "0.1.0",
  resolver: "0.1.0",
  mapper: "0.1.0",
  renderer: "0.1.0",
  critic: "0.1.0",
  repair: "0.1.0",
  learning: "0.1.0",
});

/**
 * Backward-compatible constant used by existing skeleton modules.
 *
 * @example
 * const current = WEBSITE_ENGINE_VERSION.sdk;
 */
export const WEBSITE_ENGINE_VERSION: EngineVersion = ENGINE_VERSIONS;

/**
 * Compares two dot-separated version strings.
 *
 * @example
 * compareVersions("0.2.0", "0.1.0") > 0;
 */
export function compareVersions(left: EngineVersionString, right: EngineVersionString): number {
  const normalize = (value: EngineVersionString) =>
    value.split("-")[0].split(".").map((part) => Number.parseInt(part, 10));
  const [leftMajor, leftMinor, leftPatch] = normalize(left);
  const [rightMajor, rightMinor, rightPatch] = normalize(right);
  return (
    leftMajor - rightMajor ||
    leftMinor - rightMinor ||
    leftPatch - rightPatch
  );
}

