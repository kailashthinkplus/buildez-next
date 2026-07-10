import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import { MOTION_INSPECTOR_GROUPS, buildDefaultMotionMetadata } from "../../inspector/motion/motionInspectorMetadata";
import { MOTION_PRESETS } from "../../inspector/motion/motionPresets";

const requiredGroups = ["entrance", "exit", "hover", "scroll", "parallax", "pin", "reveal", "mouse", "timeline"];
const requiredPresets = ["fade", "slide", "scale", "rotate", "blur", "reveal", "parallax", "pin", "zoom", "luxury", "editorial", "corporate", "minimal"];
const defaults = buildDefaultMotionMetadata();

export const motionMetadataSpec = createRegressionSpec({
  id: "inspector/motion-metadata",
  title: "Motion inspector metadata baseline",
  bugIds: ["BUG-0005"],
  level: "L2",
  status: "compile-safe",
  runnerRequirement: "Connect to rendered motion inspector once component test runner exists.",
  assertions: [
    assertCondition("all required motion groups exist", requiredGroups.every((id) => MOTION_INSPECTOR_GROUPS.some((group) => group.id === id))),
    assertCondition("all required motion presets exist", requiredPresets.every((id) => MOTION_PRESETS.some((preset) => preset.id === id))),
    assertCondition("motion presets are metadata only", MOTION_PRESETS.every((preset) => preset.metadataOnly && !preset.runtimeExecution)),
    assertEqual("default motion metadata blocks runtime execution", defaults.runtimeExecution, false),
    assertEqual("default motion engine is metadata", defaults.engine, "metadata"),
  ],
});
