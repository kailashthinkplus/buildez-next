import { createRegressionSpec, assertCondition } from "../helpers/testAssertions";
import { LAYERS_MODERNIZATION_METADATA } from "../../layers/layersMetadata";

export const layersMetadataSpec = createRegressionSpec({
  id: "layers/layers-metadata",
  title: "Layers modernization metadata baseline",
  bugIds: ["BUG-0014", "BUG-0015", "BUG-0046"],
  level: "L2",
  status: "compile-safe",
  runnerRequirement: "Connect to rendered Layers panel once component test runner exists.",
  assertions: [
    assertCondition("layers support collapsible tree", LAYERS_MODERNIZATION_METADATA.collapsibleTree),
    assertCondition("layers support icons", LAYERS_MODERNIZATION_METADATA.icons),
    assertCondition("layers support drag indicators", LAYERS_MODERNIZATION_METADATA.dragIndicators),
    assertCondition("layers support search", LAYERS_MODERNIZATION_METADATA.search),
    assertCondition("layers support filtering", LAYERS_MODERNIZATION_METADATA.filter),
    assertCondition("layers ordering uses CommandBus", LAYERS_MODERNIZATION_METADATA.orderingUsesCommandBus),
    assertCondition("layers carry keyboard metadata", LAYERS_MODERNIZATION_METADATA.keyboardNavigationMetadata),
  ],
});
