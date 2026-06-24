// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v7/engine/blueprintNormalizer.ts

import type { BlueprintNode } from "@/modules/builder/types";
import { generateDefaultDesignTokens } from
  "@/modules/builder/runtime/designTokens/generateDefaultDesignTokens";

/* ============================================================
   BLUEPRINT NORMALIZER — V7 (NON-DESTRUCTIVE)
   
   Philosophy:
   - AI-generated styles take precedence
   - Only fill in MISSING defaults
   - Convert semantic props → CSS defaults
   - Use design tokens with CSS variables
   - Apply modern design patterns
============================================================ */

/* ============================================================
   HELPERS
============================================================ */

function walk(
  node: BlueprintNode,
  fn: (node: BlueprintNode, parent?: BlueprintNode) => void,
  parent?: BlueprintNode
) {
  fn(node, parent);
  node.children?.forEach((c) => walk(c, fn, node));
}

/**
 * Convert hex to rgba
 */
function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace("#", "");
  
  let r: number, g: number, b: number;
  
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    return hex;
  }
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * ✅ FIXED: Non-destructive style merge
 * Only adds missing keys, preserves existing ones
 */
function mergeStyleDefaults(
  existing: Record<string, any> | undefined,
  defaults: Record<string, any>
): Record<string, any> {
  const result = { ...defaults };
  
  // Override defaults with existing values
  if (existing) {
    for (const [key, value] of Object.entries(existing)) {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Get spacing value from tokens
 */
function getSpacing(tokens: any, key: string | number, fallback: number): number {
  if (!tokens.spacing) return fallback;
  
  // Try different key formats
  const value = 
    tokens.spacing[key] ?? 
    tokens.spacing[String(key)] ?? 
    tokens.spacing[`_${key}`];
  
  return value ?? fallback;
}

/**
 * Get font size from tokens
 */
function getFontSize(tokens: any, key: string, fallback: number): number {
  if (!tokens.typography?.fontSize) return fallback;
  
  const value = tokens.typography.fontSize[key];
  return value ?? fallback;
}

/* ============================================================
   BACKGROUND VARIANT STYLES
============================================================ */

function getBackgroundStyles(
  variant: string | undefined,
  colors: any
): Record<string, any> {
  if (!variant) return {};
  
  const primary = colors?.primary || "#2563eb";
  const accent = colors?.accent || "#6366f1";
  const surface = colors?.surface || "#f8fafc";
  const muted = colors?.muted || "#f1f5f9";
  const background = colors?.background || "#ffffff";
  const textPrimary = colors?.textPrimary || "#0f172a";
  
  const styles: Record<string, Record<string, any>> = {
    solid: {
      background: `var(--color-primary, ${primary})`,
      color: `var(--color-on-primary, #ffffff)`,
    },
    gradient: {
      background: `linear-gradient(135deg, ${primary} 0%, ${accent} 50%, ${background} 100%)`,
    },
    "gradient-radial": {
      background: `radial-gradient(circle at top right, ${hexToRgba(accent, 0.2)}, ${hexToRgba(primary, 0.1)})`,
    },
    muted: {
      background: `var(--color-surface, ${surface})`,
    },
    dark: {
      background: `var(--color-text-primary, ${textPrimary})`,
      color: `var(--color-background, ${background})`,
    },
    light: {
      background: `var(--color-background, ${background})`,
    },
    transparent: {
      background: "transparent",
    },
  };
  
  return styles[variant] || {};
}

/* ============================================================
   VISUAL STYLES (for containers)
============================================================ */

function getVisualStyles(
  visual: string | undefined,
  colors: any,
  shadows: any,
  radius: any
): Record<string, any> {
  if (!visual || visual === "plain") return {};
  
  const primary = colors?.primary || "#2563eb";
  const accent = colors?.accent || "#6366f1";
  const background = colors?.background || "#ffffff";
  const border = colors?.border || "#e2e8f0";
  
  const styles: Record<string, Record<string, any>> = {
    card: {
      background: `var(--color-background, ${background})`,
      borderRadius: radius?.lg || 16,
      boxShadow: shadows?.sm || "0 1px 3px rgba(0, 0, 0, 0.1)",
      border: `1px solid var(--color-border, ${border})`,
      padding: 32,
    },
    glass: {
      background: "rgba(255, 255, 255, 0.08)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderRadius: radius?.lg || 20,
      boxShadow: shadows?.md || "0 8px 32px rgba(0, 0, 0, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      padding: 32,
    },
    gradient: {
      background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`,
      borderRadius: radius?.lg || 20,
      boxShadow: shadows?.lg || "0 10px 40px rgba(0, 0, 0, 0.15)",
      padding: 32,
      color: "#ffffff",
    },
    elevated: {
      background: `var(--color-background, ${background})`,
      borderRadius: radius?.md || 12,
      boxShadow: shadows?.md || "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      padding: 24,
    },
    bordered: {
      border: `2px solid var(--color-border, ${border})`,
      borderRadius: radius?.md || 12,
      padding: 24,
    },
    soft: {
      background: hexToRgba(primary, 0.08),
      borderRadius: radius?.lg || 16,
      padding: 24,
    },
    dark: {
      background: "#1e293b",
      borderRadius: radius?.lg || 16,
      boxShadow: shadows?.md || "0 4px 12px rgba(0, 0, 0, 0.2)",
      padding: 32,
      color: "#f1f5f9",
    },
    light: {
      background: "#f8fafc",
      borderRadius: radius?.md || 12,
      padding: 32,
    },
  };
  
  return styles[visual] || {};
}

/* ============================================================
   MAIN NORMALIZER
============================================================ */

export function normalizeBlueprint(root: BlueprintNode): BlueprintNode {
  // Ensure design tokens exist
  root.props = root.props || {};
  root.props.designTokens =
    root.props.designTokens ?? generateDefaultDesignTokens();

  const tokens = root.props.designTokens;
  const colors = tokens.colors || {};
  const typography = tokens.typography || {};
  const spacing = tokens.spacing || {};
  const shadows = tokens.shadows || {};
  const radius = tokens.radius || {};

  console.log("[Normalizer] Starting normalization with tokens:", {
    hasColors: !!colors,
    hasTypography: !!typography,
    hasSpacing: !!spacing,
    colorKeys: Object.keys(colors).length,
    spacingKeys: Object.keys(spacing).length,
  });

  let nodesProcessed = 0;
  let nodesWithAIStyles = 0;

  walk(root, (node) => {
    nodesProcessed++;
    
    node.props = node.props || {};
    
    // ✅ Check if AI set specific styles (but still apply missing defaults)
    const aiGeneratedStyles = node.props.__aiGeneratedStyles || {};
    const aiStyle = node.props.style || {};
    const hasAnyAIStyles = Object.keys(aiGeneratedStyles).length > 0 || Object.keys(aiStyle).length > 0;
    
    if (hasAnyAIStyles) {
      nodesWithAIStyles++;
    }

    /* ----------------------------------------------------------
       PAGE
    ---------------------------------------------------------- */
    if (node.type === "page") {
      const defaults = {
        fontFamily: typography.fontFamily || "system-ui, -apple-system, sans-serif",
        fontSize: 16,
        lineHeight: 1.7,
        background: `var(--color-background, ${colors.background || "#ffffff"})`,
        color: `var(--color-text-primary, ${colors.textPrimary || "#0f172a"})`,
      };
      
      // Inject CSS variables at page level
      const cssVars: Record<string, string> = {};
      
      if (colors) {
        Object.entries(colors).forEach(([key, value]) => {
          cssVars[`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value as string;
        });
      }
      
      if (typography.fontFamily) {
        cssVars["--font-family"] = typography.fontFamily;
      }
      
      node.props.cssVariables = cssVars;
      node.props.style = mergeStyleDefaults(defaults, aiStyle);
    }

    /* ----------------------------------------------------------
       SECTION
    ---------------------------------------------------------- */
    if (node.type === "section") {
      // Skip header/footer
      if (node.props.role === "header" || node.props.role === "footer") {
        return;
      }

      const backgroundVariant = node.props.backgroundVariant;
      const intent = node.props.intent;
      
      // Base section defaults
      const defaults: Record<string, any> = {
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
        paddingTop: getSpacing(tokens, "24", 96),
        paddingBottom: getSpacing(tokens, "24", 96),
      };
      
      // Hero sections get more padding
      if (intent === "hero") {
        defaults.paddingTop = getSpacing(tokens, "32", 120);
        defaults.paddingBottom = getSpacing(tokens, "32", 120);
      }
      
      // CTA sections get less padding
      if (intent === "cta") {
        defaults.paddingTop = getSpacing(tokens, "20", 80);
        defaults.paddingBottom = getSpacing(tokens, "20", 80);
      }
      
      // ✅ Apply background variant styles (only if not already set by AI)
      if (!aiStyle.background && !aiGeneratedStyles.background) {
        const bgStyles = getBackgroundStyles(backgroundVariant, colors);
        Object.assign(defaults, bgStyles);
      }
      
      node.props.style = mergeStyleDefaults(defaults, aiStyle);
    }

    /* ----------------------------------------------------------
       CONTAINER
    ---------------------------------------------------------- */
    if (node.type === "container") {
      const visual = node.props.visual;
      const layout = node.props.layout;
      
      const defaults: Record<string, any> = {
        position: "relative",
        width: "100%",
        maxWidth: 1280,
        marginLeft: "auto",
        marginRight: "auto",
        paddingLeft: getSpacing(tokens, "6", 24),
        paddingRight: getSpacing(tokens, "6", 24),
        boxSizing: "border-box",
      };
      
      // Layout-specific styles
      if (layout === "columns") {
        defaults.display = "flex";
        defaults.flexDirection = "row";
        defaults.flexWrap = "wrap";
        defaults.gap = getSpacing(tokens, "8", 32);
        defaults.alignItems = "flex-start";
      } else if (layout === "grid") {
        defaults.display = "grid";
        defaults.gridTemplateColumns = `repeat(${node.props.columns || 3}, 1fr)`;
        defaults.gap = getSpacing(tokens, "8", 32);
      } else {
        defaults.display = "flex";
        defaults.flexDirection = "column";
        defaults.gap = getSpacing(tokens, "6", 24);
      }
      
      // ✅ Apply visual styles (only if not already set by AI)
      if (!aiStyle.background && !aiGeneratedStyles.background) {
        const visualStyles = getVisualStyles(visual, colors, shadows, radius);
        Object.assign(defaults, visualStyles);
      }
      
      node.props.style = mergeStyleDefaults(defaults, aiStyle);
    }

    /* ----------------------------------------------------------
       COLUMN
    ---------------------------------------------------------- */
    if (node.type === "column") {
      const defaults: Record<string, any> = {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: getSpacing(tokens, "4", 16),
        flex: node.props.width ? "0 0 auto" : "1 1 0%",
        minWidth: 0,
        boxSizing: "border-box",
      };
      
      if (node.props.width) {
        defaults.width = node.props.width;
      }
      
      node.props.style = mergeStyleDefaults(defaults, aiStyle);
    }

    /* ----------------------------------------------------------
       HEADING
    ---------------------------------------------------------- */
    if (node.type === "heading") {
      const level = node.props.level || "h2";
      const emphasis = node.props.emphasis;
      
      const fontSizes: Record<string, number> = {
        h1: getFontSize(tokens, "5xl", 48),
        h2: getFontSize(tokens, "4xl", 36),
        h3: getFontSize(tokens, "3xl", 30),
        h4: getFontSize(tokens, "2xl", 24),
        h5: getFontSize(tokens, "xl", 20),
        h6: getFontSize(tokens, "lg", 18),
      };
      
      const defaults: Record<string, any> = {
        display: "block",
        margin: 0,
        fontSize: fontSizes[level],
        fontWeight: typography.fontWeight?.bold || 700,
        lineHeight: typography.lineHeight?.tight || 1.2,
        letterSpacing: typography.letterSpacing?.tight || "-0.02em",
        marginBottom: getSpacing(tokens, "4", 16),
        color: `var(--color-text-primary, ${colors.textPrimary || "#0f172a"})`,
      };
      
      // Heading emphasis effects
      if (emphasis === "gradient" && !aiStyle.background) {
        defaults.background = `linear-gradient(135deg, ${colors.primary || "#2563eb"}, ${colors.accent || "#6366f1"})`;
        defaults.WebkitBackgroundClip = "text";
        defaults.backgroundClip = "text";
        defaults.color = "transparent";
      }
      
      if (emphasis === "bold") {
        defaults.fontWeight = 800;
        defaults.letterSpacing = "-0.03em";
      }
      
      node.props.style = mergeStyleDefaults(defaults, aiStyle);
    }

    /* ----------------------------------------------------------
       TEXT
    ---------------------------------------------------------- */
    if (node.type === "text") {
      const role = node.props.role || "body";
      
      const roleStyles: Record<string, any> = {
        lead: {
          fontSize: getFontSize(tokens, "lg", 20),
          lineHeight: 1.6,
          opacity: 0.9,
        },
        body: {
          fontSize: getFontSize(tokens, "base", 16),
          lineHeight: 1.7,
          opacity: 0.85,
        },
        caption: {
          fontSize: getFontSize(tokens, "sm", 14),
          lineHeight: 1.5,
          opacity: 0.7,
        },
        subheading: {
          fontSize: getFontSize(tokens, "sm", 14),
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          opacity: 0.7,
        },
      };
      
      const defaults = {
        display: "block",
        margin: 0,
        marginBottom: getSpacing(tokens, "3", 12),
        color: `var(--color-text-secondary, ${colors.textSecondary || "#475569"})`,
        ...(roleStyles[role] || roleStyles.body),
      };
      
      node.props.style = mergeStyleDefaults(defaults, aiStyle);
    }

    /* ----------------------------------------------------------
       BUTTON
    ---------------------------------------------------------- */
    if (node.type === "button") {
      const variant = node.props.variant || "primary";
      
      const baseDefaults = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 14,
        paddingBottom: 14,
        paddingLeft: 32,
        paddingRight: 32,
        borderRadius: radius?.md || 12,
        fontSize: 16,
        fontWeight: typography.fontWeight?.semibold || 600,
        lineHeight: 1,
        border: "none",
        cursor: "pointer",
        transition: "all 200ms ease",
        whiteSpace: "nowrap",
        textDecoration: "none",
      };
      
      // Variant-specific styles
      const variantStyles: Record<string, Record<string, any>> = {
        primary: {
          background: `var(--color-primary, ${colors.primary || "#2563eb"})`,
          color: `var(--color-on-primary, ${colors.onPrimary || "#ffffff"})`,
          boxShadow: shadows?.sm || "0 1px 3px rgba(0,0,0,0.1)",
        },
        secondary: {
          background: "transparent",
          color: `var(--color-primary, ${colors.primary || "#2563eb"})`,
          border: `2px solid var(--color-primary, ${colors.primary || "#2563eb"})`,
        },
        ghost: {
          background: "transparent",
          color: `var(--color-text-primary, ${colors.textPrimary || "#0f172a"})`,
          border: "none",
        },
        gradient: {
          background: `linear-gradient(135deg, ${colors.primary || "#2563eb"} 0%, ${colors.accent || "#6366f1"} 100%)`,
          color: "#ffffff",
          boxShadow: `0 4px 14px ${hexToRgba(colors.primary || "#2563eb", 0.4)}`,
        },
      };
      
      const defaults = {
        ...baseDefaults,
        ...(variantStyles[variant] || variantStyles.primary),
      };
      
      node.props.style = mergeStyleDefaults(defaults, aiStyle);
    }

    /* ----------------------------------------------------------
       IMAGE
    ---------------------------------------------------------- */
    if (node.type === "image") {
      const effect = node.props.effect || "none";
      
      const defaults: Record<string, any> = {
        display: "block",
        width: "100%",
        height: "auto",
        objectFit: "cover",
        borderRadius: radius?.lg || 16,
        overflow: "hidden",
      };
      
      // Image effects
      if (effect === "shadow") {
        defaults.boxShadow = shadows?.lg || "0 25px 50px -12px rgba(0,0,0,0.25)";
      } else if (effect === "border") {
        defaults.border = `4px solid ${colors.background || "#ffffff"}`;
        defaults.boxShadow = shadows?.md || "0 10px 40px rgba(0,0,0,0.15)";
      } else if (effect === "glow") {
        defaults.boxShadow = `0 0 60px ${hexToRgba(colors.primary || "#2563eb", 0.3)}`;
      }
      
      node.props.style = mergeStyleDefaults(defaults, aiStyle);
    }

    /* ----------------------------------------------------------
       ICON
    ---------------------------------------------------------- */
    if (node.type === "icon") {
      const variant = node.props.variant || "default";
      
      const variantStyles: Record<string, any> = {
        default: {
          color: `var(--color-primary, ${colors.primary || "#2563eb"})`,
        },
        filled: {
          background: `var(--color-primary, ${colors.primary || "#2563eb"})`,
          color: `var(--color-on-primary, ${colors.onPrimary || "#ffffff"})`,
          padding: 12,
          borderRadius: radius?.md || 12,
        },
        soft: {
          background: hexToRgba(colors.primary || "#2563eb", 0.15),
          color: `var(--color-primary, ${colors.primary || "#2563eb"})`,
          padding: 12,
          borderRadius: radius?.md || 12,
        },
        gradient: {
          background: `linear-gradient(135deg, ${colors.primary || "#2563eb"}, ${colors.accent || "#6366f1"})`,
          color: "#ffffff",
          padding: 12,
          borderRadius: radius?.md || 12,
        },
      };
      
      const defaults = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
        ...(variantStyles[variant] || variantStyles.default),
      };
      
      node.props.style = mergeStyleDefaults(defaults, aiStyle);
    }

    /* ----------------------------------------------------------
       SPACER
    ---------------------------------------------------------- */
    if (node.type === "spacer") {
      const defaults = {
        height: node.props.height || getSpacing(tokens, "8", 32),
      };
      
      node.props.style = mergeStyleDefaults(defaults, aiStyle);
    }
  });

  console.log("[Normalizer] Normalization complete:", {
    nodesProcessed,
    nodesWithAIStyles,
    percentWithAI: Math.round((nodesWithAIStyles / nodesProcessed) * 100),
  });

  return root;
}
