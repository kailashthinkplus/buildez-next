import type { EngineVersionString } from "../sdk";

export const MOTION_INTELLIGENCE_VERSION_STRING = "0.1.0" as EngineVersionString;

export const MOTION_INTELLIGENCE_VERSION = Object.freeze({
  module: "motion-intelligence",
  version: MOTION_INTELLIGENCE_VERSION_STRING,
  localOnly: true,
});
