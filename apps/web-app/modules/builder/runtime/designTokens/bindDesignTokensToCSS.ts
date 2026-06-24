// /Users/kailash/buildez/apps/web-app/modules/builder/runtime/designTokens/bindDesignTokensToCSS.ts

import { DesignTokens } from "./designTokens.types";

/* ============================================================
   DESIGN TOKENS → CSS STRING (LOCKED)
   
   Generates a complete CSS stylesheet with all design tokens
   as CSS custom properties. Used for:
   - SSR (injected in <style> tag)
   - Static export (saved as .css file)
   - Runtime theming (injected dynamically)
============================================================ */

/**
 * Generate CSS custom properties from design tokens
 * @param tokens - Design tokens object
 * @param selector - CSS selector to apply tokens to (default: :root)
 * @returns CSS string with all design tokens
 */
export function bindDesignTokensToCSS(
  tokens: DesignTokens,
  selector: string = ":root"
): string {
  const lines: string[] = [];

  lines.push(`/* ============================================================`);
  lines.push(`   BUILDEZ DESIGN TOKENS (AUTO-GENERATED)`);
  lines.push(`   Generated: ${new Date().toISOString()}`);
  lines.push(`============================================================ */`);
  lines.push(``);
  lines.push(`${selector} {`);

  /* ----------------------------------------------------------
     COLORS
  ---------------------------------------------------------- */

  lines.push(`  /* --------------------------------------------`);
  lines.push(`     COLORS`);
  lines.push(`  -------------------------------------------- */`);
  
  // Base surfaces
  lines.push(`  --color-background: ${tokens.colors.background};`);
  lines.push(`  --color-surface: ${tokens.colors.surface};`);
  if (tokens.colors.muted) {
    lines.push(`  --color-muted: ${tokens.colors.muted};`);
  }
  lines.push(``);

  // Text
  lines.push(`  --color-text-primary: ${tokens.colors.textPrimary};`);
  lines.push(`  --color-text-secondary: ${tokens.colors.textSecondary};`);
  if (tokens.colors.textTertiary) {
    lines.push(`  --color-text-tertiary: ${tokens.colors.textTertiary};`);
  }
  if (tokens.colors.onBackground) {
    lines.push(`  --color-on-background: ${tokens.colors.onBackground};`);
  }
  lines.push(``);

  // Borders
  lines.push(`  --color-border: ${tokens.colors.border};`);
  if (tokens.colors.borderHover) {
    lines.push(`  --color-border-hover: ${tokens.colors.borderHover};`);
  }
  lines.push(``);

  // Brand colors
  lines.push(`  --color-primary: ${tokens.colors.primary};`);
  lines.push(`  --color-primary-hover: ${tokens.colors.primaryHover};`);
  lines.push(`  --color-on-primary: ${tokens.colors.onPrimary};`);
  if (tokens.colors.primaryLight) {
    lines.push(`  --color-primary-light: ${tokens.colors.primaryLight};`);
  }
  lines.push(``);

  lines.push(`  --color-accent: ${tokens.colors.accent};`);
  if (tokens.colors.accentHover) {
    lines.push(`  --color-accent-hover: ${tokens.colors.accentHover};`);
  }
  if (tokens.colors.onAccent) {
    lines.push(`  --color-on-accent: ${tokens.colors.onAccent};`);
  }
  lines.push(``);

  // Status colors
  if (tokens.colors.success) {
    lines.push(`  --color-success: ${tokens.colors.success};`);
  }
  if (tokens.colors.warning) {
    lines.push(`  --color-warning: ${tokens.colors.warning};`);
  }
  if (tokens.colors.error) {
    lines.push(`  --color-error: ${tokens.colors.error};`);
  }
  if (tokens.colors.info) {
    lines.push(`  --color-info: ${tokens.colors.info};`);
  }

  /* ----------------------------------------------------------
     TYPOGRAPHY
  ---------------------------------------------------------- */

  lines.push(``);
  lines.push(`  /* --------------------------------------------`);
  lines.push(`     TYPOGRAPHY`);
  lines.push(`  -------------------------------------------- */`);
  
  lines.push(`  --font-family: ${tokens.typography.fontFamily};`);
  lines.push(``);

  // Font sizes
  if (tokens.typography.fontSize) {
    Object.entries(tokens.typography.fontSize)
      .sort(([a], [b]) => {
        // Sort by size: xs, sm, base, lg, xl, 2xl, 3xl, etc.
        const order = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'];
        return order.indexOf(a) - order.indexOf(b);
      })
      .forEach(([key, value]) => {
        if (value !== undefined) {
          lines.push(`  --font-size-${key}: ${value}px;`);
        }
      });
    lines.push(``);
  }

  // Font weights
  if (tokens.typography.fontWeight) {
    Object.entries(tokens.typography.fontWeight)
      .sort(([, a], [, b]) => (a || 0) - (b || 0))
      .forEach(([key, value]) => {
        if (value !== undefined) {
          lines.push(`  --font-weight-${key}: ${value};`);
        }
      });
    lines.push(``);
  }

  // Line heights
  if (tokens.typography.lineHeight) {
    Object.entries(tokens.typography.lineHeight).forEach(([key, value]) => {
      if (value !== undefined) {
        lines.push(`  --line-height-${key}: ${value};`);
      }
    });
    lines.push(``);
  }

  // Letter spacing
  if (tokens.typography.letterSpacing) {
    Object.entries(tokens.typography.letterSpacing).forEach(([key, value]) => {
      if (value !== undefined) {
        lines.push(`  --letter-spacing-${key}: ${value};`);
      }
    });
  }

  /* ----------------------------------------------------------
     SPACING (Tailwind-compatible scale)
  ---------------------------------------------------------- */

  lines.push(``);
  lines.push(`  /* --------------------------------------------`);
  lines.push(`     SPACING (Tailwind scale)`);
  lines.push(`  -------------------------------------------- */`);
  
  Object.entries(tokens.spacing)
    .sort(([a], [b]) => {
      // Sort numerically: 0, 1, 2, 3, 4, 6, 8, 10, 12, etc.
      return parseInt(a) - parseInt(b);
    })
    .forEach(([key, value]) => {
      if (value !== undefined) {
        lines.push(`  --spacing-${key}: ${value}px;`);
      }
    });

  // Common aliases
  lines.push(``);
  lines.push(`  /* Common spacing aliases */`);
  if (tokens.spacing["4"]) {
    lines.push(`  --spacing-base: ${tokens.spacing["4"]}px;`);
  }
  if (tokens.spacing["8"]) {
    lines.push(`  --spacing-lg: ${tokens.spacing["8"]}px;`);
  }
  if (tokens.spacing["24"]) {
    lines.push(`  --spacing-section: ${tokens.spacing["24"]}px;`);
  }

  /* ----------------------------------------------------------
     SHADOWS
  ---------------------------------------------------------- */

  if (tokens.shadows && Object.keys(tokens.shadows).length > 0) {
    lines.push(``);
    lines.push(`  /* --------------------------------------------`);
    lines.push(`     SHADOWS`);
    lines.push(`  -------------------------------------------- */`);
    
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      if (value !== undefined) {
        lines.push(`  --shadow-${key}: ${value};`);
      }
    });
  }

  /* ----------------------------------------------------------
     BORDER RADIUS
  ---------------------------------------------------------- */

  if (tokens.radius && Object.keys(tokens.radius).length > 0) {
    lines.push(``);
    lines.push(`  /* --------------------------------------------`);
    lines.push(`     BORDER RADIUS`);
    lines.push(`  -------------------------------------------- */`);
    
    Object.entries(tokens.radius).forEach(([key, value]) => {
      if (value !== undefined) {
        lines.push(`  --radius-${key}: ${value}px;`);
      }
    });
  }

  /* ----------------------------------------------------------
     TRANSITIONS
  ---------------------------------------------------------- */

  if (tokens.transitions && Object.keys(tokens.transitions).length > 0) {
    lines.push(``);
    lines.push(`  /* --------------------------------------------`);
    lines.push(`     TRANSITIONS`);
    lines.push(`  -------------------------------------------- */`);
    
    Object.entries(tokens.transitions).forEach(([key, value]) => {
      if (value !== undefined) {
        lines.push(`  --transition-${key}: ${value};`);
      }
    });
  }

  /* ----------------------------------------------------------
     Z-INDEX
  ---------------------------------------------------------- */

  if (tokens.zIndex && Object.keys(tokens.zIndex).length > 0) {
    lines.push(``);
    lines.push(`  /* --------------------------------------------`);
    lines.push(`     Z-INDEX`);
    lines.push(`  -------------------------------------------- */`);
    
    Object.entries(tokens.zIndex).forEach(([key, value]) => {
      if (value !== undefined) {
        lines.push(`  --z-index-${key}: ${value};`);
      }
    });
  }

  /* ----------------------------------------------------------
     BUTTONS (Legacy support)
  ---------------------------------------------------------- */

  if (tokens.buttons) {
    lines.push(``);
    lines.push(`  /* --------------------------------------------`);
    lines.push(`     BUTTONS (Legacy)`);
    lines.push(`  -------------------------------------------- */`);
    
    if (tokens.buttons.radius !== undefined) {
      lines.push(`  --button-radius: ${tokens.buttons.radius}px;`);
    }
    if (tokens.buttons.paddingY !== undefined) {
      lines.push(`  --button-padding-y: ${tokens.buttons.paddingY}px;`);
    }
    if (tokens.buttons.paddingX !== undefined) {
      lines.push(`  --button-padding-x: ${tokens.buttons.paddingX}px;`);
    }
  }

  lines.push(`}`);
  lines.push(``);

  /* ----------------------------------------------------------
     UTILITY CLASSES (Optional)
  ---------------------------------------------------------- */

  lines.push(`/* ============================================`);
  lines.push(`   UTILITY CLASSES`);
  lines.push(`============================================ */`);
  lines.push(``);
  
  lines.push(`/* Text colors */`);
  lines.push(`.text-primary { color: var(--color-text-primary); }`);
  lines.push(`.text-secondary { color: var(--color-text-secondary); }`);
  lines.push(`.text-brand { color: var(--color-primary); }`);
  lines.push(``);

  lines.push(`/* Background colors */`);
  lines.push(`.bg-primary { background-color: var(--color-primary); color: var(--color-on-primary); }`);
  lines.push(`.bg-surface { background-color: var(--color-surface); }`);
  lines.push(`.bg-muted { background-color: var(--color-muted); }`);
  lines.push(``);

  lines.push(`/* Shadows */`);
  lines.push(`.shadow-sm { box-shadow: var(--shadow-sm); }`);
  lines.push(`.shadow-md { box-shadow: var(--shadow-md); }`);
  lines.push(`.shadow-lg { box-shadow: var(--shadow-lg); }`);
  lines.push(``);

  lines.push(`/* Border radius */`);
  lines.push(`.rounded-sm { border-radius: var(--radius-sm); }`);
  lines.push(`.rounded-md { border-radius: var(--radius-md); }`);
  lines.push(`.rounded-lg { border-radius: var(--radius-lg); }`);
  lines.push(`.rounded-full { border-radius: var(--radius-full); }`);
  lines.push(``);

  return lines.join("\n");
}

/**
 * Generate minimal CSS (only essential tokens)
 * Useful for critical CSS or performance optimization
 */
export function bindDesignTokensToCSSMinimal(tokens: DesignTokens): string {
  return `
:root {
  /* Colors */
  --color-background: ${tokens.colors.background};
  --color-text-primary: ${tokens.colors.textPrimary};
  --color-primary: ${tokens.colors.primary};
  --color-on-primary: ${tokens.colors.onPrimary};
  
  /* Typography */
  --font-family: ${tokens.typography.fontFamily};
  
  /* Spacing */
  --spacing-4: ${tokens.spacing["4"] || 16}px;
  --spacing-8: ${tokens.spacing["8"] || 32}px;
  --spacing-24: ${tokens.spacing["24"] || 96}px;
}`.trim();
}

/**
 * Generate legacy CSS variable names for backward compatibility
 * Maps new token structure to old --be-* variables
 */
export function bindDesignTokensToCSSLegacy(tokens: DesignTokens): string {
  return `
:root {
  /* Legacy variable names (deprecated) */
  --be-bg: ${tokens.colors.background};
  --be-surface: ${tokens.colors.surface};
  --be-text-primary: ${tokens.colors.textPrimary};
  --be-text-secondary: ${tokens.colors.textSecondary};
  --be-border: ${tokens.colors.border};
  --be-primary: ${tokens.colors.primary};
  --be-primary-hover: ${tokens.colors.primaryHover};
  --be-on-primary: ${tokens.colors.onPrimary};
  ${tokens.colors.accent ? `--be-accent: ${tokens.colors.accent};` : ''}
  
  /* Map to new variable names */
  --color-background: var(--be-bg);
  --color-surface: var(--be-surface);
  --color-text-primary: var(--be-text-primary);
  --color-text-secondary: var(--be-text-secondary);
  --color-border: var(--be-border);
  --color-primary: var(--be-primary);
  --color-primary-hover: var(--be-primary-hover);
  --color-on-primary: var(--be-on-primary);
}`.trim();
}
