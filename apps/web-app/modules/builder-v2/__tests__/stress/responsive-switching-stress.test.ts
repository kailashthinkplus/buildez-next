import { assertEqual } from "../helpers/testAssertions";
import { createExactNodeCountBlueprint } from "../helpers/testLargeBlueprintFactory";
import { readResponsiveValueForSpec } from "../helpers/testResponsiveHarness";
import { collectStressMetrics, createRepeatedDeviceSwitches, createStressScenarioSpec } from "../helpers/testStressHarness";

const blueprint = createExactNodeCountBlueprint(100);
const switches = createRepeatedDeviceSwitches(300);
const firstResponsiveNode = Object.values(blueprint.nodes).find((node) => typeof node.style.paddingTop === "object");
const metrics = collectStressMetrics(blueprint, {
  commandCount: switches.length,
  historyDepth: 0,
});

export const responsiveSwitchingStressSpec = createStressScenarioSpec({
  id: "stress/responsive-switching",
  title: "Repeated desktop/tablet/mobile switching stress baseline",
  bugIds: ["BUG-0002", "BUG-0019", "BUG-0049"],
  status: "compile-safe",
  runnerRequirement: "Future browser runner should bind switches to viewport controls and verify canvas/preview parity.",
  metrics,
  assertions: [
    assertEqual("responsive switch sequence length", switches.length, 300),
    assertEqual("first switch starts on desktop", switches[0], "desktop"),
    assertEqual("third switch reaches mobile", switches[2], "mobile"),
    assertEqual(
      "responsive fixture preserves mobile value lookup",
      readResponsiveValueForSpec(firstResponsiveNode?.style.paddingTop, "mobile", 0),
      32
    ),
  ],
});
