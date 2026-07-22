import { createPrimitiveBlueprint, createTestNode, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import { getRenderContainerWidthStyle, getRenderSectionContentWidthStyle } from "../../core/rendering";
import { getContainerWidthModeProps } from "../../inspector/utils/containerWidth";
import { defaultThemeTokens } from "../../theme/defaultTheme";

const options = { device: "desktop" as const, scale: 1, canvasWidth: 1440 };
const blueprint = createPrimitiveBlueprint();
const section = blueprint.nodes[TEST_NODE_IDS.section];
section.props = { ...section.props, container: "boxed", maxWidth: "800px" };
section.style = { ...section.style, width: "100%", maxWidth: "999px" };

const boxedOuter = getRenderContainerWidthStyle(section, blueprint, options);
const boxedInner = getRenderSectionContentWidthStyle(section, blueprint, options);
const fullSection = { ...section, props: getContainerWidthModeProps(section, "full") };
const fullInner = getRenderSectionContentWidthStyle(fullSection, blueprint, options);
const restoredProps = getContainerWidthModeProps(fullSection, "boxed");

const directContainer = blueprint.nodes[TEST_NODE_IDS.container];
directContainer.props = { ...directContainer.props, container: "boxed", maxWidth: "640px" };
const directStyle = getRenderContainerWidthStyle(directContainer, blueprint, options);

const nestedId = "nested-container";
blueprint.nodes[nestedId] = createTestNode(nestedId, "container", TEST_NODE_IDS.container, {
  props: { container: "boxed", maxWidth: { desktop: "72rem", tablet: "90%", mobile: "88vw" } },
});
const nestedDesktop = getRenderContainerWidthStyle(blueprint.nodes[nestedId], blueprint, options);
const nestedTablet = getRenderContainerWidthStyle(blueprint.nodes[nestedId], blueprint, { ...options, device: "tablet" });
const nestedMobile = getRenderContainerWidthStyle(blueprint.nodes[nestedId], blueprint, { ...options, device: "mobile" });

const inherited = createPrimitiveBlueprint();
const inheritedSection = inherited.nodes[TEST_NODE_IDS.section];
inheritedSection.props = { container: "boxed" };
inheritedSection.style = { ...inheritedSection.style, maxWidth: undefined };
const inheritedDesktop = getRenderSectionContentWidthStyle(inheritedSection, inherited, options);
const inheritedTablet = getRenderSectionContentWidthStyle(inheritedSection, inherited, { ...options, device: "tablet" });
const inheritedMobile = getRenderSectionContentWidthStyle(inheritedSection, inherited, { ...options, device: "mobile" });

const themed = createPrimitiveBlueprint();
themed.theme = {
  ...themed.theme,
  tokens: {
    ...themed.theme.tokens,
    defaults: {
      container: {
        maxWidth: "1040px",
        paddingX: { desktop: 30, tablet: 22, mobile: 14 },
      },
    },
  },
};
themed.nodes[TEST_NODE_IDS.section].props = { container: "boxed" };
const themedInherited = getRenderSectionContentWidthStyle(
  themed.nodes[TEST_NODE_IDS.section],
  themed,
  options
);
const parityStyle = getRenderSectionContentWidthStyle(inheritedSection, inherited, options);

export const layoutControlsSpec = createRegressionSpec({
  id: "inspector/layout-controls",
  title: "Canonical section and container width contract",
  bugIds: ["BUG-0009"],
  level: "L1",
  status: "compile-safe",
  assertions: [
    assertEqual("section outer remains full bleed", boxedOuter.width, "100%"),
    assertEqual("section outer has no max width", boxedOuter.maxWidth, "none"),
    assertEqual("boxed inner fills available width", boxedInner.width, "100%"),
    assertEqual("boxed inner uses configured max width without canvas clamping", boxedInner.maxWidth, "800px"),
    assertEqual("boxed inner left margin is auto", boxedInner.marginLeft, "auto"),
    assertEqual("boxed inner right margin is auto", boxedInner.marginRight, "auto"),
    assertEqual("full inner fills width", fullInner.width, "100%"),
    assertEqual("full inner removes boxed constraint", fullInner.maxWidth, "none"),
    assertEqual("full inner has no boxed gutter", fullInner.paddingLeft, undefined),
    assertEqual("mode round trip preserves boxed max width", restoredProps.maxWidth, "800px"),
    assertEqual("direct section child adds no max width", directStyle.maxWidth, "none"),
    assertEqual("nested container supports its own max width", nestedDesktop.maxWidth, "72rem"),
    assertEqual("tablet max width resolves", nestedTablet.maxWidth, "90%"),
    assertEqual("mobile max width resolves", nestedMobile.maxWidth, "88vw"),
    assertEqual("new boxed section inherits canonical max width", inheritedDesktop.maxWidth, defaultThemeTokens.defaults.container.maxWidth),
    assertCondition("canonical boxed width is narrower than desktop canvas", Number.parseFloat(String(inheritedDesktop.maxWidth)) < options.canvasWidth),
    assertEqual("theme container width overrides builder default", themedInherited.maxWidth, "1040px"),
    assertEqual("desktop gutter inherits theme default", inheritedDesktop.paddingLeft, "24px"),
    assertEqual("tablet gutter resolves responsively", inheritedTablet.paddingLeft, "20px"),
    assertEqual("mobile gutter resolves responsively", inheritedMobile.paddingLeft, "16px"),
    assertEqual("canvas/runtime shared helper parity is exact", JSON.stringify(inheritedDesktop), JSON.stringify(parityStyle)),
  ],
});
