import type { EngineVersionString } from "../sdk";

export const CREATIVE_PROVIDERS_VERSION_STRING = "0.1.0" as EngineVersionString;

export const CREATIVE_PROVIDERS_VERSION = Object.freeze({
  module: "creative-providers",
  version: CREATIVE_PROVIDERS_VERSION_STRING,
  localOnly: true,
});
