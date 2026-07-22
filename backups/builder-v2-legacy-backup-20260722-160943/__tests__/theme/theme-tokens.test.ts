import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import { defaultThemeTokens } from "../../theme/defaultTheme";
import { flattenThemeTokenMetadata, getThemeTokenValue } from "../../theme/themeTokenMetadata";

const tokens = flattenThemeTokenMetadata(defaultThemeTokens);
const paths = new Set(tokens.map((token) => token.path));

export const themeTokensSpec = createRegressionSpec({
  id: "theme/theme-tokens",
  title: "Theme token metadata baseline",
  bugIds: ["BUG-0016", "BUG-0017", "BUG-0001"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Connect token metadata to rendered token picker once component test runner exists.",
  assertions: [
    assertCondition("color tokens exist", paths.has("theme.colors.primary") && paths.has("theme.colors.background")),
    assertCondition("font tokens exist", paths.has("theme.typography.headingFont") && paths.has("theme.typography.bodyFont")),
    assertCondition("spacing tokens exist", paths.has("theme.spacing.sectionY") && paths.has("theme.spacing.containerX")),
    assertCondition("container default tokens exist", paths.has("theme.defaults.container.maxWidth") && paths.has("theme.defaults.container.paddingX")),
    assertCondition("radius tokens exist", paths.has("theme.radius.button") && paths.has("theme.radius.card")),
    assertCondition("shadow tokens exist", paths.has("theme.shadow.card") && paths.has("theme.shadow.media")),
    assertCondition("semantic state tokens exist", paths.has("theme.states.focusRing") && paths.has("theme.states.error")),
    assertCondition("form tokens exist", paths.has("theme.forms.background") && paths.has("theme.forms.borderFocus")),
    assertCondition("card tokens exist", paths.has("theme.cards.background") && paths.has("theme.cards.hoverBackground")),
    assertEqual("token value lookup resolves primary color", getThemeTokenValue(defaultThemeTokens, "theme.colors.primary"), defaultThemeTokens.colors.primary),
    assertEqual("container max width comes from canonical theme defaults", getThemeTokenValue(defaultThemeTokens, "theme.defaults.container.maxWidth"), "1120px"),
  ],
});
