import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { createRegressionSpec, assertEqual } from "../helpers/testAssertions";
import { resolveRenderStyle } from "../../core/rendering";

const blueprint = createPrimitiveBlueprint();
const section = blueprint.nodes[TEST_NODE_IDS.section];
section.style = {
  ...section.style,
  backgroundImage: { desktop: "url(desktop.jpg)", mobile: "url(mobile.jpg)" },
  backgroundSize: { desktop: "cover", mobile: "contain" },
  backgroundRepeat: { desktop: "no-repeat", mobile: "repeat-x" },
  backgroundPosition: { desktop: "center center", mobile: "top left" },
  backgroundAttachment: { desktop: "scroll", mobile: "local" },
};

const desktop = resolveRenderStyle(section, blueprint, { device: "desktop", scale: 1 });
const mobile = resolveRenderStyle(section, blueprint, { device: "mobile", scale: 1 });

const inheritedRepeatBlueprint = createPrimitiveBlueprint();
const inheritedRepeatSection = inheritedRepeatBlueprint.nodes[TEST_NODE_IDS.section];
inheritedRepeatSection.style = {
  ...inheritedRepeatSection.style,
  backgroundImage: "url(shared.jpg)",
  backgroundSize: { desktop: "cover", mobile: "contain" },
};
const inheritedRepeatMobile = resolveRenderStyle(inheritedRepeatSection, inheritedRepeatBlueprint, {
  device: "mobile",
  scale: 1,
});

export const backgroundControlsSpec = createRegressionSpec({
  id: "canvas/background-controls",
  title: "Background controls resolve responsively in shared rendering",
  bugIds: ["BUG-BACKGROUND-CONTROLS"],
  level: "L1",
  status: "compile-safe",
  assertions: [
    assertEqual("desktop cover resolves", desktop.backgroundSize, "cover"),
    assertEqual("desktop no-repeat resolves", desktop.backgroundRepeat, "no-repeat"),
    assertEqual("mobile contain resolves", mobile.backgroundSize, "contain"),
    assertEqual("mobile repeat-x resolves", mobile.backgroundRepeat, "repeat-x"),
    assertEqual("mobile position resolves", mobile.backgroundPosition, "top left"),
    assertEqual("mobile attachment resolves", mobile.backgroundAttachment, "local"),
    assertEqual("responsive background image resolves", mobile.backgroundImage, "url(mobile.jpg)"),
    assertEqual("mobile image backgrounds default to no-repeat", inheritedRepeatMobile.backgroundRepeat, "no-repeat"),
  ],
});
