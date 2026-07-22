import type { EngineVersionString } from "../sdk";

export const COMPOSITION_ENGINE_VERSION_STRING = "0.1.0" as EngineVersionString;

export const COMPOSITION_ENGINE_VERSION = Object.freeze({
  module: "composition",
  version: COMPOSITION_ENGINE_VERSION_STRING,
  localOnly: true,
});
