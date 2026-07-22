import { createRegressionSpec, assertCondition } from "../helpers/testAssertions";
import { defaultThemeTokens } from "../../theme/defaultTheme";
import { buildThemeTokenMetadata } from "../../theme/themeTokenMetadata";

const sections = buildThemeTokenMetadata(defaultThemeTokens);
const requiredSections = ["colors", "typography", "spacing", "radius", "shadow", "buttons", "defaults"];

export const themePanelsSpec = createRegressionSpec({
  id: "theme/theme-panels",
  title: "Theme panels expose non-empty sections",
  bugIds: ["BUG-0016", "BUG-0017"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Connect to rendered sidebar theme panels once component test runner exists.",
  assertions: [
    assertCondition("theme panel sections exist", sections.length >= requiredSections.length),
    assertCondition(
      "required theme sections are present",
      requiredSections.every((id) => sections.some((section) => section.id === id))
    ),
    assertCondition(
      "every theme section has tokens",
      sections.every((section) => section.tokens.length > 0)
    ),
  ],
});
