import { createRegressionSpec, assertCondition } from "../helpers/testAssertions";
import { PremiumWidgetDefinitions } from "../../widgets/premium";
import { getWidgetCapability } from "../../widgets/widgetCapabilities";
import { buildWidgetAiReadiness } from "../../widgets/widgetAiReadiness";
import type { NodeType } from "../../types/blueprint";

const productionWidgetTypes: NodeType[] = [
  "accordion",
  "tabs",
  "testimonials",
  "pricing",
  "statsCounter",
  "logoCloud",
  "gallery",
  "masonryGallery",
  "team",
  "portfolio",
  "timeline",
  "cta",
  "featureGrid",
  "leadForm",
  "contactForm",
  "locationMap",
  "socialLinks",
  "carousel",
  "beforeAfter",
  "table",
  "countdown",
  "codeBlock",
  "embed",
  "popupModal",
  "blogGrid",
  "postList",
  "categoryList",
];

const definitions = new Map(PremiumWidgetDefinitions.map((definition) => [definition.type, definition]));
const readiness = new Map(buildWidgetAiReadiness().map((entry) => [entry.type, entry]));
const runtimeGatedTypes = new Set<NodeType>();

export const productionWidgetLibrarySpec = createRegressionSpec({
  id: "widgets/production-widget-library",
  title: "Production widget library native contracts",
  bugIds: ["BUG-0003", "BUG-0012", "BUG-0042"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Wire to real widget runner once Builder test execution is available.",
  assertions: [
    assertCondition(
      "every BSP-15 production widget is registered",
      productionWidgetTypes.every((type) => definitions.has(type))
    ),
    assertCondition(
      "every production widget has content inspector controls",
      productionWidgetTypes.every((type) => getWidgetCapability(type)?.supportedInspectorGroups.includes("content"))
    ),
    assertCondition(
      "every production widget has design inspector controls",
      productionWidgetTypes.every((type) => getWidgetCapability(type)?.supportedInspectorGroups.includes("design"))
    ),
    assertCondition(
      "every production widget has advanced inspector metadata",
      productionWidgetTypes.every((type) => getWidgetCapability(type)?.supportedInspectorGroups.includes("advanced"))
    ),
    assertCondition(
      "every production widget has responsive metadata",
      productionWidgetTypes.every((type) => getWidgetCapability(type)?.supportedInspectorGroups.includes("responsive"))
    ),
    assertCondition(
      "every production widget has theme token metadata",
      productionWidgetTypes.every((type) => (getWidgetCapability(type)?.themeTokenFields.length ?? 0) > 0)
    ),
    assertCondition(
      "every production widget has editable content regions",
      productionWidgetTypes.every((type) => (getWidgetCapability(type)?.editableProps.length ?? 0) > 0)
    ),
    assertCondition(
      "every production widget has editable style regions",
      productionWidgetTypes.every((type) => (getWidgetCapability(type)?.editableStyles.length ?? 0) > 0)
    ),
    assertCondition(
      "every premium widget exposes element-level typography controls",
      productionWidgetTypes.every((type) => {
        const styles = new Set(getWidgetCapability(type)?.editableStyles ?? []);
        return ["eyebrowFontFamily", "titleFontFamily", "titleFontSize", "bodyFontFamily", "bodyFontSize"]
          .every((field) => styles.has(field));
      })
    ),
    assertCondition(
      "every premium widget exposes CTA and card design controls",
      productionWidgetTypes.every((type) => {
        const styles = new Set(getWidgetCapability(type)?.editableStyles ?? []);
        return ["ctaBackgroundColor", "ctaColor", "ctaFontFamily", "cardBackgroundColor", "cardTextColor"]
          .every((field) => styles.has(field));
      })
    ),
    assertCondition(
      "every premium widget exposes featured media treatment metadata",
      productionWidgetTypes.every((type) => {
        const styles = new Set(getWidgetCapability(type)?.editableStyles ?? []);
        return ["mediaUrl", "mediaObjectPosition", "mediaBorderRadius"].every((field) => styles.has(field));
      })
    ),
    assertCondition(
      "clipboard support is enabled through native node commands",
      productionWidgetTypes.every((type) => getWidgetCapability(type)?.clipboardSupport)
    ),
    assertCondition(
      "undo/redo support is enabled through CommandBus contracts",
      productionWidgetTypes.every((type) => getWidgetCapability(type)?.undoRedoSupport)
    ),
    assertCondition(
      "serialization requirements are explicit for every production widget",
      productionWidgetTypes.every((type) => (getWidgetCapability(type)?.serializationRequirements.length ?? 0) >= 5)
    ),
    assertCondition(
      "incomplete interactions are runtime-gated rather than reported production-ready",
      productionWidgetTypes.every((type) => {
        const capability = getWidgetCapability(type);
        if (runtimeGatedTypes.has(type)) return capability?.runtimeParityStatus === "gated";
        return capability?.runtimeParityStatus === "production-ready";
      })
    ),
    assertCondition(
      "AI readiness is explicit for every production widget",
      productionWidgetTypes.every((type) => readiness.has(type))
    ),
    assertCondition(
      "AI insertion remains disabled until BSP AI gates open",
      productionWidgetTypes.every((type) => readiness.get(type)?.canAIInsert === false)
    ),
  ],
});
