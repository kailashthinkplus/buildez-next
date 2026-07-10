import type { EngineVersionString } from "../sdk";

export const COMPONENT_ENGINE_VERSION_STRING = "0.1.0" as EngineVersionString;

export const COMPONENT_ENGINE_VERSION = Object.freeze({
  module: "components",
  version: COMPONENT_ENGINE_VERSION_STRING,
  localOnly: true,
});
