import type { BuilderBlueprint } from "../../types/blueprint";
import { defaultThemeTokens } from "../../theme/defaultTheme";
import type { BuilderThemeTokens } from "../../theme/theme.types";

const TOKEN_ALIAS_MAP: Record<string, string> = {
  "text.primary": "colors.textPrimary",
  "text.secondary": "colors.textSecondary",
  "primary.500": "colors.primary",
  primary: "colors.primary",
  accent: "colors.accent",
  surface: "colors.surface",
  "surface.muted": "colors.surfaceAlt",
  background: "colors.background",
  border: "colors.border",
};

export function getRenderThemeTokens(blueprint: BuilderBlueprint): BuilderThemeTokens {
  return blueprint.theme?.tokens &&
    typeof blueprint.theme.tokens === "object" &&
    !Array.isArray(blueprint.theme.tokens)
    ? (blueprint.theme.tokens as unknown as BuilderThemeTokens)
    : defaultThemeTokens;
}

export function getRenderThemeValue(
  blueprint: BuilderBlueprint,
  path: string
): unknown {
  const tokens = getRenderThemeTokens(blueprint);

  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }
    return (current as Record<string, unknown>)[key];
  }, tokens);
}

export function resolveRenderThemeToken(
  value: unknown,
  blueprint: BuilderBlueprint
): unknown {
  if (typeof value !== "string" || !value) return value;

  const exactThemeMatch = value.match(/^theme\.(.+)$/);
  if (exactThemeMatch) {
    return getRenderThemeValue(blueprint, exactThemeMatch[1]) ?? value;
  }

  const aliasPath = TOKEN_ALIAS_MAP[value];
  if (aliasPath) {
    return getRenderThemeValue(blueprint, aliasPath) ?? value;
  }

  if (
    value === "transparent" ||
    value === "white" ||
    value === "black" ||
    value.startsWith("#") ||
    value.startsWith("rgb") ||
    value.startsWith("hsl") ||
    value.startsWith("linear-gradient") ||
    value.startsWith("radial-gradient") ||
    value.startsWith("url(")
  ) {
    return value;
  }

  return value.replace(/theme\.([a-zA-Z0-9_.]+)/g, (match, path) => {
    const resolved = getRenderThemeValue(blueprint, path);
    return resolved === undefined || resolved === null ? match : String(resolved);
  });
}

export function resolveRenderColor(
  value: unknown,
  fallback: string,
  blueprint: BuilderBlueprint
): string | undefined {
  const resolved = resolveRenderThemeToken(value, blueprint);
  if (resolved === undefined || resolved === null || resolved === "") {
    return fallback || undefined;
  }
  return String(resolved);
}
