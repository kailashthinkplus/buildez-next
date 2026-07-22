import type { EngineVersionString } from "../sdk";

export const VISUAL_MOOD_ENGINE_VERSION_STRING = "0.1.0" as EngineVersionString;

export const VISUAL_MOOD_ENGINE_VERSION = Object.freeze({
  module: "visual-mood",
  version: VISUAL_MOOD_ENGINE_VERSION_STRING,
  localOnly: true,
});
