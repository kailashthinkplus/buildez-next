import { createRegressionSpec, assertCondition } from "../helpers/testAssertions";
import { PremiumWidgetDefinitions } from "../../widgets/premium";

const productionDefinitions = PremiumWidgetDefinitions.filter((definition) =>
  [
    "accordion",
    "tabs",
    "testimonials",
    "pricing",
    "statsCounter",
    "logoCloud",
    "masonryGallery",
    "team",
    "portfolio",
    "timeline",
    "featureGrid",
    "contactForm",
    "socialLinks",
    "carousel",
    "beforeAfter",
    "table",
    "countdown",
    "codeBlock",
    "embed",
    "blogGrid",
    "postList",
    "categoryList",
  ].includes(definition.type)
);

export const productionWidgetSerializationSpec = createRegressionSpec({
  id: "widgets/production-widget-serialization",
  title: "Production widget serialization contracts",
  bugIds: ["BUG-0037", "BUG-0025", "BUG-0026", "BUG-0039"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Run against blueprint roundtrip harness once widget runner exists.",
  assertions: [
    assertCondition(
      "production widget default nodes serialize as native node shape",
      productionDefinitions.every((definition) => {
        const node = definition.defaultNode;
        return node.type === definition.type && Array.isArray(node.children) && Boolean(node.props) && Boolean(node.style);
      })
    ),
    assertCondition(
      "production widgets do not store opaque html/template payloads",
      productionDefinitions.every((definition) => {
        const serialized = JSON.stringify(definition.defaultNode).toLowerCase();
        return !serialized.includes("<script") && !serialized.includes("dangerouslysetinnerhtml") && !serialized.includes("templatehtml");
      })
    ),
    assertCondition(
      "restricted embed defaults are policy text, not executable markup",
      !JSON.stringify(PremiumWidgetDefinitions.find((definition) => definition.type === "embed")?.defaultNode ?? {}).includes("<")
    ),
  ],
});
