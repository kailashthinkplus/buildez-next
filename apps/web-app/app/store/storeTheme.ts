import type { CSSProperties } from "react";
import { normalizeThemeTokens } from "@/modules/builder-v2/theme/defaultTheme";
import type { BuilderThemeTokens } from "@/modules/builder-v2/theme/theme.types";

/** Normalizes a site's stored designTokens (the same BuilderThemeTokens shape
 * the rest of the site is themed with) into CSS custom properties, so the
 * Shopez storefront inherits the site's actual brand look instead of a
 * hardcoded palette. `normalizeThemeTokens` already fills in safe defaults
 * for any missing/malformed fields, so this is safe to call unconditionally. */
export function resolveStoreTheme(raw: unknown): BuilderThemeTokens {
  return normalizeThemeTokens(raw);
}

export function storeThemeVars(tokens: BuilderThemeTokens): CSSProperties {
  const c = tokens.colors;
  return {
    ["--shop-bg" as string]: c.background,
    ["--shop-surface" as string]: c.surface,
    ["--shop-text" as string]: c.textPrimary,
    ["--shop-text-muted" as string]: c.textSecondary,
    ["--shop-border" as string]: c.border,
    ["--shop-primary" as string]: tokens.buttons.primary.backgroundColor || c.primary,
    ["--shop-primary-hover" as string]: c.primary,
    ["--shop-on-primary" as string]: tokens.buttons.primary.color || c.primaryContrast,
    ["--shop-error" as string]: tokens.states.error,
    ["--shop-radius-button" as string]: `${tokens.buttons.primary.borderRadius ?? tokens.radius.button}px`,
    ["--shop-radius-card" as string]: `${tokens.radius.card}px`,
    ["--shop-radius-media" as string]: `${tokens.radius.media}px`,
    ["--shop-primary-soft" as string]: `color-mix(in srgb, ${c.primary} 14%, ${c.background})`,
    ["--shop-primary-soft-strong" as string]: `color-mix(in srgb, ${c.primary} 28%, ${c.background})`,
    ["--shop-font" as string]: tokens.typography.bodyFont,
    ["--shop-heading-font" as string]: tokens.typography.headingFont,
  } as CSSProperties;
}
