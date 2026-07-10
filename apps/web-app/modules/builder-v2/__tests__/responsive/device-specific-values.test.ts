import { createResponsiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import {
  readResponsiveResolutionForSpec,
  readResponsiveValueForSpec,
  resetResponsiveValueForSpec,
  writeResponsiveValueForSpec,
} from "../helpers/testResponsiveHarness";

const blueprint = createResponsiveBlueprint();
const container = blueprint.nodes[TEST_NODE_IDS.container];
const desktopOnly = writeResponsiveValueForSpec(undefined, "desktop", "80%");
const tabletResolution = readResponsiveResolutionForSpec(desktopOnly, "tablet", "auto");
const tabletOverride = writeResponsiveValueForSpec(desktopOnly, "tablet", "72%");
const mobileInheritedFromTablet = readResponsiveResolutionForSpec(tabletOverride, "mobile", "auto");
const mobileOverride = writeResponsiveValueForSpec(tabletOverride, "mobile", "64%");
const mobileReset = resetResponsiveValueForSpec(mobileOverride, "mobile");
const activeDeviceOnly = writeResponsiveValueForSpec(container.style.gap, "mobile", 12);

export const deviceSpecificValuesSpec = createRegressionSpec({
  id: "responsive/device-specific-values",
  title: "Device-specific responsive values baseline",
  bugIds: ["BUG-0002", "BUG-0019"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Add canvas viewport and preview assertions when browser test runner exists.",
  assertions: [
    assertEqual(
      "desktop width resolves independently",
      readResponsiveValueForSpec(container.style.width, "desktop", "auto"),
      "100%"
    ),
    assertEqual(
      "tablet width resolves independently",
      readResponsiveValueForSpec(container.style.width, "tablet", "auto"),
      "92%"
    ),
    assertEqual(
      "tablet inherits desktop until override",
      tabletResolution.value,
      "80%"
    ),
    assertEqual(
      "tablet inheritance source is desktop",
      tabletResolution.inheritedFrom,
      "desktop"
    ),
    assertEqual(
      "mobile inherits tablet before mobile override",
      mobileInheritedFromTablet.value,
      "72%"
    ),
    assertEqual(
      "mobile inheritance source is tablet",
      mobileInheritedFromTablet.inheritedFrom,
      "tablet"
    ),
    assertEqual(
      "mobile gap override can be written",
      readResponsiveValueForSpec(activeDeviceOnly, "mobile", 0),
      12
    ),
    assertEqual(
      "resetting mobile override restores tablet inheritance",
      readResponsiveValueForSpec(mobileReset, "mobile", "auto"),
      "72%"
    ),
    assertCondition(
      "inspector update changes active device only",
      readResponsiveValueForSpec(activeDeviceOnly, "desktop", 0) !== 12
    ),
  ],
});
