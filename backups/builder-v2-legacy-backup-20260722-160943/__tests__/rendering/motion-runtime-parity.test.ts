import { buildRuntimeMotionEntries } from "../../motion/runtimeMotionEntries";
import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { assertCondition, assertEqual, createRegressionSpec } from "../helpers/testAssertions";

const blueprint = createPrimitiveBlueprint();
const nodeId = TEST_NODE_IDS.heading;
blueprint.nodes[nodeId] = {
  ...blueprint.nodes[nodeId],
  props: {
    ...blueprint.nodes[nodeId].props,
    motionPreset: "slide",
    advanced: {
      motion: {
        engine: "parallax",
        duration: 0.8,
        delay: 0.1,
        ease: "power2.out",
        trigger: "viewport",
        parallaxHorizontal: 0.2,
        parallaxVertical: 0.15,
        hoverTranslateY: -8,
        hoverScale: 1.04,
        hoverOpacity: 0.9,
        mouseStrength: 12,
        pin: true,
        pinTop: 24,
      },
    },
  },
};
const entry = buildRuntimeMotionEntries(blueprint).find((item) => item.nodeId === nodeId);

export const motionRuntimeParitySpec = createRegressionSpec({
  id: "rendering/motion-runtime-parity",
  title: "Canvas and published runtime share normalized motion entries",
  bugIds: ["BUG-0005"],
  level: "L2",
  status: "compile-safe",
  assertions: [
    assertCondition("motion entry is generated", Boolean(entry)),
    assertEqual("legacy premium preset is normalized", entry?.preset, "slide"),
    assertEqual("parallax engine is retained", entry?.engine, "parallax"),
    assertEqual("viewport trigger is retained", entry?.trigger, "viewport"),
    assertEqual("horizontal parallax is normalized to percent", entry?.parallaxHorizontal, 10),
    assertEqual("vertical parallax is normalized to percent", entry?.parallaxVertical, 7.5),
    assertEqual("hover lift is retained", entry?.hoverTranslateY, -8),
    assertEqual("hover scale is retained", entry?.hoverScale, 1.04),
    assertEqual("mouse follow is retained", entry?.mouseStrength, 12),
    assertEqual("pin offset is retained", entry?.pinTop, 24),
  ],
});
