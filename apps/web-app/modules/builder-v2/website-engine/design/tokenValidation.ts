import type { DesignTokens } from "../sdk";
import type { ColorProfile, SpacingProfile, ThemeProfile, TypographyProfile } from "./designIntent";
import { DESIGN_ENGINE_VERSION_STRING } from "./version";

/**
 * Builds SDK design tokens from deterministic design profiles.
 *
 * @example
 * const tokens = buildDesignTokens(color, typography, spacing, theme);
 */
export function buildDesignTokens(
  color: ColorProfile,
  typography: TypographyProfile,
  spacing: SpacingProfile,
  theme: ThemeProfile
): DesignTokens {
  return Object.freeze({
    id: `design-tokens.${theme.themeName}`,
    version: DESIGN_ENGINE_VERSION_STRING,
    color: {
      background: color.background,
      foreground: color.foreground,
      accent: color.accent,
      muted: color.muted,
    },
    typography: {
      headingFamily: typography.headingFamily,
      bodyFamily: typography.bodyFamily,
      scale: typography.scale,
    },
    spacing: {
      sectionY: spacing.sectionY,
      gutter: spacing.gutter,
      gridGap: spacing.gridGap,
    },
    radius: {
      small: theme.radius === "small" ? 6 : 8,
      medium: theme.radius === "small" ? 8 : 12,
      large: theme.radius === "small" ? 12 : 16,
    },
    shadow: {
      card: theme.shadow,
      elevated: theme.shadow,
    },
  });
}

/**
 * Validates the minimal SDK DesignTokens shape.
 *
 * @example
 * const valid = validateDesignTokens(tokens);
 */
export function validateDesignTokens(tokens: DesignTokens): string[] {
  const issues: string[] = [];
  if (!tokens.id) issues.push("tokens.id missing");
  if (!tokens.version) issues.push("tokens.version missing");
  for (const key of ["background", "foreground", "accent", "muted"]) {
    if (!tokens.color[key]) issues.push(`tokens.color.${key} missing`);
  }
  if (!tokens.typography.headingFamily || !tokens.typography.bodyFamily) issues.push("tokens.typography families missing");
  if (tokens.spacing.sectionY === undefined) issues.push("tokens.spacing.sectionY missing");
  return issues;
}
