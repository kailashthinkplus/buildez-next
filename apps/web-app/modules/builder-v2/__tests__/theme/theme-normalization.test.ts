import { normalizeBlueprint } from "../../core/serialization";
import { defaultThemeTokens, normalizeTheme, normalizeThemeTokens } from "../../theme/defaultTheme";
import { validateBlueprint } from "../../core/validation";
import { createPrimitiveBlueprint } from "../fixtures/testBlueprintFixtures";
import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";

const missingThemeBlueprint = {
  ...createPrimitiveBlueprint(),
  theme: undefined,
};
const emptyThemeBlueprint = {
  ...createPrimitiveBlueprint(),
  theme: {},
};
const missingColors = normalizeTheme({
  id: "partial",
  name: "Partial",
  preset: "partial",
  tokens: {},
});
const missingBackground = normalizeTheme({
  id: "partial-colors",
  name: "Partial Colors",
  preset: "partial-colors",
  tokens: {
    colors: {
      primary: "#123456",
    },
  },
});
const preservedUserColor = normalizeTheme({
  id: "brand",
  name: "Brand",
  preset: "brand",
  tokens: {
    colors: {
      background: "#101010",
      primary: "#ff00aa",
      accent: "#00ffaa",
    },
  },
});
const normalizedMissingTheme = normalizeBlueprint(
  missingThemeBlueprint as unknown as ReturnType<typeof createPrimitiveBlueprint>
);
const normalizedEmptyTheme = normalizeBlueprint(
  emptyThemeBlueprint as unknown as ReturnType<typeof createPrimitiveBlueprint>
);
const normalizedMissingThemeTokens = normalizeThemeTokens(normalizedMissingTheme.theme.tokens);
const normalizedEmptyThemeTokens = normalizeThemeTokens(normalizedEmptyTheme.theme.tokens);
const missingColorsTokens = normalizeThemeTokens(missingColors.tokens);
const missingBackgroundTokens = normalizeThemeTokens(missingBackground.tokens);
const preservedUserColorTokens = normalizeThemeTokens(preservedUserColor.tokens);
const noUndefinedTheme = normalizeTheme({
  id: "undefined-theme",
  name: undefined as unknown as string,
  preset: "undefined-theme",
  tokens: {
    colors: {
      background: undefined,
      primary: "#111827",
    },
    spacing: {
      sectionY: undefined,
    },
  },
});
const noUndefinedThemeTokens = normalizeThemeTokens(noUndefinedTheme.tokens);
const normalizedTokensFromUndefined = normalizeThemeTokens(undefined);

export const themeNormalizationSpec = createRegressionSpec({
  id: "theme/theme-normalization",
  title: "Theme normalization prevents missing token crashes",
  bugIds: ["BUG-0041"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Run with the future Builder unit test runner once configured.",
  assertions: [
    assertCondition(
      "missing blueprint.theme is repaired",
      validateBlueprint(normalizedMissingTheme).valid &&
        normalizedMissingThemeTokens.colors.background === defaultThemeTokens.colors.background
    ),
    assertCondition(
      "empty theme object gets defaults",
      validateBlueprint(normalizedEmptyTheme).valid &&
        normalizedEmptyThemeTokens.colors.background === defaultThemeTokens.colors.background
    ),
    assertEqual(
      "missing theme.colors gets default background",
      missingColorsTokens.colors.background,
      defaultThemeTokens.colors.background
    ),
    assertEqual(
      "missing theme.colors.background gets default background",
      missingBackgroundTokens.colors.background,
      defaultThemeTokens.colors.background
    ),
    assertEqual("partial theme preserves user primary color", missingBackgroundTokens.colors.primary, "#123456"),
    assertEqual("partial theme preserves user background color", preservedUserColorTokens.colors.background, "#101010"),
    assertEqual("partial theme preserves user accent color", preservedUserColorTokens.colors.accent, "#00ffaa"),
    assertCondition(
      "normalizing undefined tokens returns safe defaults",
      normalizedTokensFromUndefined.colors.background === defaultThemeTokens.colors.background
    ),
    assertCondition(
      "no undefined values remain after theme normalization",
      !JSON.stringify(noUndefinedTheme).includes("undefined") &&
        noUndefinedThemeTokens.colors.background === defaultThemeTokens.colors.background
    ),
  ],
});
