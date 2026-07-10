import { createPrimitiveBlueprint, createResponsiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import {
  compareRenderContractsForSpec,
  createCanvasRuntimeContractForSpec,
  hasBuilderOnlyOverlayLeakForSpec,
  missingAssetFallsBackForSpec,
  resolveCanvasStyleForSpec,
  resolveRuntimeStyleForSpec,
  resolveThemeTokenForSpec,
  widgetHasNativeParityContractForSpec,
} from "../helpers/testParityHarness";

const primitive = createPrimitiveBlueprint();
const responsive = createResponsiveBlueprint();
const primitiveContract = createCanvasRuntimeContractForSpec(primitive);
const responsiveContract = createCanvasRuntimeContractForSpec(responsive, "mobile");
const heading = primitive.nodes[TEST_NODE_IDS.heading];
const responsiveContainer = responsive.nodes[TEST_NODE_IDS.container];
const canvasHeadingStyle = resolveCanvasStyleForSpec(heading, primitive);
const runtimeHeadingStyle = resolveRuntimeStyleForSpec(heading, primitive);
const canvasMobileStyle = resolveCanvasStyleForSpec(responsiveContainer, responsive, "mobile");
const runtimeMobileStyle = resolveRuntimeStyleForSpec(responsiveContainer, responsive, "mobile");
const missingImage = {
  ...primitive.nodes[TEST_NODE_IDS.image],
  props: {
    ...primitive.nodes[TEST_NODE_IDS.image].props,
    src: "",
  },
};

export const canvasRuntimeContractSpec = createRegressionSpec({
  id: "parity/canvas-runtime-contract",
  title: "Canvas/runtime contract baseline",
  bugIds: ["BUG-0025", "BUG-0026", "BUG-0027", "BUG-0039"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Replace contract summaries with rendered canvas/runtime snapshots when a runner exists.",
  assertions: [
    assertEqual("primitive contract covers all nodes", primitiveContract.length, Object.keys(primitive.nodes).length),
    assertEqual("responsive contract covers all nodes", responsiveContract.length, Object.keys(responsive.nodes).length),
    assertCondition(
      "contract comparison is deterministic for same input",
      compareRenderContractsForSpec(primitiveContract, createCanvasRuntimeContractForSpec(primitive))
    ),
    assertEqual(
      "same node resolves same style in canvas/runtime",
      JSON.stringify(canvasHeadingStyle),
      JSON.stringify(runtimeHeadingStyle)
    ),
    assertEqual(
      "responsive style parity matches for mobile canvas/runtime",
      JSON.stringify(canvasMobileStyle),
      JSON.stringify(runtimeMobileStyle)
    ),
    assertEqual(
      "theme token parity resolves aliases",
      resolveThemeTokenForSpec("primary.500", primitive),
      "#2563eb"
    ),
    assertCondition(
      "unsupported widget handling is explicit",
      !widgetHasNativeParityContractForSpec("custom")
    ),
    assertCondition(
      "missing asset handling has a safe fallback contract",
      missingAssetFallsBackForSpec(missingImage)
    ),
    assertCondition(
      "publish/preview contract uses same render snapshot shape",
      compareRenderContractsForSpec(primitiveContract, createCanvasRuntimeContractForSpec(primitive))
    ),
    assertCondition(
      "builder-only overlay styles do not leak into runtime contract",
      primitiveContract.every((node) => !hasBuilderOnlyOverlayLeakForSpec(node))
    ),
  ],
});
