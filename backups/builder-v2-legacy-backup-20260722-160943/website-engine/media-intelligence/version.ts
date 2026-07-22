import type { EngineVersionString } from "../sdk";

export const MEDIA_INTELLIGENCE_VERSION_STRING = "0.1.0" as EngineVersionString;

export const MEDIA_INTELLIGENCE_VERSION = Object.freeze({
  module: "media-intelligence",
  version: MEDIA_INTELLIGENCE_VERSION_STRING,
  localOnly: true,
});
