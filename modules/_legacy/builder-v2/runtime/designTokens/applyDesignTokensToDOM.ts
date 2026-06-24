// /Users/kailash/buildez/apps/web-app/modules/builder/runtime/designTokens/applyDesignTokensToDOM.ts

import { DesignTokens } from "./designTokens.types";

/* ============================================================
   APPLY DESIGN TOKENS → CSS VARIABLES (RUNTIME)
   
   Injects all design tokens as CSS custom properties for use
   in stylesheets and inline styles.
============================================================ */

/**
 * Apply design tokens to DOM as CSS variables
 * @param tokens - Design tokens object
 * @param targetElement - Optional target element (defaults to #buildez-preview-root)
 */
export function applyDesignTokensToDOM(
  tokens: DesignTokens,
  targetElement?: HTMLElement
) {
  const root = 
    targetElement ?? 
    document.getElementById("buildez-preview-root") ??
    document.documentElement;

  if (!root) {
    console.warn("[DesignTokens] Target element not found, skipping CSS variable injection");
    return;
  }

  const style = root.style;

  /* ----------------------------------------------------------
     COLORS
  ---------------------------------------------------------- */
  
  // Base surfaces
  style.setProperty("--color-background", tokens.colors.background);
  style.setProperty("--color-surface", tokens.colors.surface);
  if (tokens.colors.muted) {
    style.setProperty("--color-muted", tokens.colors.muted);
  }

  // Text
  style.setProperty("--color-text-primary", tokens.colors.textPrimary);
  style.setProperty("--color-text-secondary", tokens.colors.textSecondary);
  if (tokens.colors.textTertiary) {
    style.setProperty("--color-text-tertiary", tokens.colors.textTertiary);
  }
  if (tokens.colors.onBackground) {
    style.setProperty("--color-on-background", tokens.colors.onBackground);
  }

  // Borders
  style.setProperty("--color-border", tokens.colors.border);
  if (tokens.colors.borderHover) {
    style.setProperty("--color-border-hover", tokens.colors.borderHover);
  }

  // Brand colors
  style.setProperty("--color-primary", tokens.colors.primary);
  style.setProperty("--color-primary-hover", tokens.colors.primaryHover);
  style.setProperty("--color-on-primary", tokens.colors.onPrimary);
  if (tokens.colors.primaryLight) {
    style.setProperty("--color-primary-light", tokens.colors.primaryLight);
  }

  style.setProperty("--color-accent", tokens.colors.accent);
  if (tokens.colors.accentHover) {
    style.setProperty("--color-accent-hover", tokens.colors.accentHover);
  }
  if (tokens.colors.onAccent) {
    style.setProperty("--color-on-accent", tokens.colors.onAccent);
  }

  // Status colors
  if (tokens.colors.success) {
    style.setProperty("--color-success", tokens.colors.success);
  }
  if (tokens.colors.warning) {
    style.setProperty("--color-warning", tokens.colors.warning);
  }
  if (tokens.colors.error) {
    style.setProperty("--color-error", tokens.colors.error);
  }
  if (tokens.colors.info) {
    style.setProperty("--color-info", tokens.colors.info);
  }

  /* ----------------------------------------------------------
     TYPOGRAPHY
  ---------------------------------------------------------- */

  // Font family
  style.setProperty("--font-family", tokens.typography.fontFamily);

  // Font sizes
  if (tokens.typography.fontSize) {
    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      if (value !== undefined) {
        style.setProperty(`--font-size-${key}`, `${value}px`);
      }
    });
  }

  // Font weights
  if (tokens.typography.fontWeight) {
    Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
      if (value !== undefined) {
        style.setProperty(`--font-weight-${key}`, String(value));
      }
    });
  }

  // Line heights
  if (tokens.typography.lineHeight) {
    Object.entries(tokens.typography.lineHeight).forEach(([key, value]) => {
      if (value !== undefined) {
        style.setProperty(`--line-height-${key}`, String(value));
      }
    });
  }

  // Letter spacing
  if (tokens.typography.letterSpacing) {
    Object.entries(tokens.typography.letterSpacing).forEach(([key, value]) => {
      if (value !== undefined) {
        style.setProperty(`--letter-spacing-${key}`, value);
      }
    });
  }

  /* ----------------------------------------------------------
     SPACING (Tailwind-compatible scale)
  ---------------------------------------------------------- */

  Object.entries(tokens.spacing).forEach(([key, value]) => {
    if (value !== undefined) {
      style.setProperty(`--spacing-${key}`, `${value}px`);
    }
  });

  // Common spacing aliases for convenience
  if (tokens.spacing["4"]) {
    style.setProperty("--spacing-base", `${tokens.spacing["4"]}px`);
  }
  if (tokens.spacing["8"]) {
    style.setProperty("--spacing-lg", `${tokens.spacing["8"]}px`);
  }
  if (tokens.spacing["24"]) {
    style.setProperty("--spacing-section", `${tokens.spacing["24"]}px`);
  }

  /* ----------------------------------------------------------
     SHADOWS
  ---------------------------------------------------------- */

  if (tokens.shadows) {
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      if (value !== undefined) {
        style.setProperty(`--shadow-${key}`, value);
      }
    });
  }

  /* ----------------------------------------------------------
     BORDER RADIUS
  ---------------------------------------------------------- */

  if (tokens.radius) {
    Object.entries(tokens.radius).forEach(([key, value]) => {
      if (value !== undefined) {
        style.setProperty(`--radius-${key}`, `${value}px`);
      }
    });
  }

  /* ----------------------------------------------------------
     BUTTONS (Legacy support)
  ---------------------------------------------------------- */

  if (tokens.buttons) {
    if (tokens.buttons.radius !== undefined) {
      style.setProperty("--button-radius", `${tokens.buttons.radius}px`);
    }
    if (tokens.buttons.paddingY !== undefined) {
      style.setProperty("--button-padding-y", `${tokens.buttons.paddingY}px`);
    }
    if (tokens.buttons.paddingX !== undefined) {
      style.setProperty("--button-padding-x", `${tokens.buttons.paddingX}px`);
    }
  }

  /* ----------------------------------------------------------
     TRANSITIONS
  ---------------------------------------------------------- */

  if (tokens.transitions) {
    Object.entries(tokens.transitions).forEach(([key, value]) => {
      if (value !== undefined) {
        style.setProperty(`--transition-${key}`, value);
      }
    });
  }

  /* ----------------------------------------------------------
     Z-INDEX
  ---------------------------------------------------------- */

  if (tokens.zIndex) {
    Object.entries(tokens.zIndex).forEach(([key, value]) => {
      if (value !== undefined) {
        style.setProperty(`--z-index-${key}`, String(value));
      }
    });
  }

  console.log("[DesignTokens] Applied to DOM:", {
    colors: Object.keys(tokens.colors).length,
    spacing: Object.keys(tokens.spacing).length,
    fontSize: Object.keys(tokens.typography.fontSize || {}).length,
    shadows: Object.keys(tokens.shadows || {}).length,
    radius: Object.keys(tokens.radius || {}).length,
  });
}

/**
 * Remove all design token CSS variables from DOM
 */
export function removeDesignTokensFromDOM(targetElement?: HTMLElement) {
  const root = 
    targetElement ?? 
    document.getElementById("buildez-preview-root") ??
    document.documentElement;

  if (!root) return;

  // Get all custom properties
  const styles = root.style;
  const propertiesToRemove: string[] = [];

  // Collect all --color-*, --spacing-*, etc. properties
  for (let i = 0; i < styles.length; i++) {
    const prop = styles[i];
    if (
      prop.startsWith("--color-") ||
      prop.startsWith("--font-") ||
      prop.startsWith("--spacing-") ||
      prop.startsWith("--shadow-") ||
      prop.startsWith("--radius-") ||
      prop.startsWith("--button-") ||
      prop.startsWith("--transition-") ||
      prop.startsWith("--z-index-")
    ) {
      propertiesToRemove.push(prop);
    }
  }

  // Remove collected properties
  propertiesToRemove.forEach(prop => {
    styles.removeProperty(prop);
  });

  console.log("[DesignTokens] Removed from DOM:", propertiesToRemove.length);
}

/**
 * Generate CSS stylesheet from design tokens
 * Useful for SSR or static export
 */
export function generateDesignTokensCSS(tokens: DesignTokens, selector = ":root"): string {
  const lines: string[] = [`${selector} {`];

  // Colors
  lines.push(`  /* Colors */`);
  lines.push(`  --color-background: ${tokens.colors.background};`);
  lines.push(`  --color-surface: ${tokens.colors.surface};`);
  lines.push(`  --color-text-primary: ${tokens.colors.textPrimary};`);
  lines.push(`  --color-text-secondary: ${tokens.colors.textSecondary};`);
  lines.push(`  --color-border: ${tokens.colors.border};`);
  lines.push(`  --color-primary: ${tokens.colors.primary};`);
  lines.push(`  --color-primary-hover: ${tokens.colors.primaryHover};`);
  lines.push(`  --color-on-primary: ${tokens.colors.onPrimary};`);
  lines.push(`  --color-accent: ${tokens.colors.accent};`);

  // Typography
  lines.push(`  /* Typography */`);
  lines.push(`  --font-family: ${tokens.typography.fontFamily};`);
  
  if (tokens.typography.fontSize) {
    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      if (value !== undefined) {
        lines.push(`  --font-size-${key}: ${value}px;`);
      }
    });
  }

  // Spacing
  lines.push(`  /* Spacing */`);
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    if (value !== undefined) {
      lines.push(`  --spacing-${key}: ${value}px;`);
    }
  });

  // Shadows
  if (tokens.shadows) {
    lines.push(`  /* Shadows */`);
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      if (value !== undefined) {
        lines.push(`  --shadow-${key}: ${value};`);
      }
    });
  }

  // Radius
  if (tokens.radius) {
    lines.push(`  /* Border Radius */`);
    Object.entries(tokens.radius).forEach(([key, value]) => {
      if (value !== undefined) {
        lines.push(`  --radius-${key}: ${value}px;`);
      }
    });
  }

  lines.push(`}`);

  return lines.join("\n");
}
