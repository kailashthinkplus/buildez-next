// /modules/builder/ai-v7/engine/applyNodeStyles.ts

import type { BlueprintNode } from "@/modules/builder/types";

/* ============================================================
   APPLY NODE STYLES — V7 (FIXED)
   🎯 PRESERVES COLORS, BACKGROUNDS, AND VISUAL EFFECTS
============================================================ */

/**
 * Layout properties that AI should NEVER override.
 * These are controlled by the layout engine.
 */
const PROTECTED_LAYOUT_PROPS = new Set([
  "display",
  "flexDirection",
  "flex",
  "flexWrap",
  "flexGrow",
  "flexShrink",
  "flexBasis",
  "gridTemplateColumns",
  "gridTemplateRows",
  "gridColumn",
  "gridRow",
  "position",
  "width",
  "maxWidth",
  "minWidth",
  "height",
  "maxHeight",
  "minHeight",
]);

/**
 * Filters out layout-breaking properties while preserving visual styles.
 */
function filterSafeStyles(
  aiStyle: Record<string, any>
): Record<string, any> {
  const safe: Record<string, any> = {};

  for (const [key, value] of Object.entries(aiStyle)) {
    // Skip layout properties
    if (PROTECTED_LAYOUT_PROPS.has(key)) {
      continue;
    }

    // Skip null/undefined values
    if (value == null) {
      continue;
    }

    safe[key] = value;
  }

  return safe;
}

/**
 * Applies AI-generated styles to nodes by TYPE.
 *
 * Rules:
 * - Styles are keyed by NODE TYPE (not ID) for global application
 * - Layout properties are protected (display, flex, width, etc.)
 * - Colors, backgrounds, and visual effects ARE applied
 * - Inspector styles always have final authority
 * - Never mutates input
 *
 * @param root - The blueprint tree root
 * @param nodeStyles - Map of node type → styles (e.g., { section: { padding: "96px" } })
 */
export function applyNodeStyles(
  root: BlueprintNode,
  nodeStyles: Record<string, Record<string, any>>
): BlueprintNode {
  function walk(node: BlueprintNode): BlueprintNode {
    // Check for styles by node TYPE (global styling)
    const typeStyle = nodeStyles[node.type];

    // Check for styles by node ID (specific targeting)
    const idStyle = nodeStyles[node.id];

    // Merge type-level and id-level styles (id takes precedence)
    const aiStyle = {
      ...(typeStyle ?? {}),
      ...(idStyle ?? {}),
    };

    let nextProps = node.props ?? {};

    if (Object.keys(aiStyle).length > 0) {
      // Filter out layout-breaking properties, keep everything else
      const safeStyle = filterSafeStyles(aiStyle);

      // Preserve existing styles, layer AI styles, inspector always wins
      const existingStyle = node.props?.style ?? {};
      const inspectorStyle = node.props?.__inspectorStyle ?? {};

      nextProps = {
        ...node.props,
        style: {
          ...existingStyle,
          ...safeStyle,
          ...inspectorStyle, // Inspector always has final authority
        },
      };
    }

    return {
      ...node,
      props: nextProps,
      children: node.children?.map(walk) ?? [],
    };
  }

  return walk(structuredClone(root));
}

/* ============================================================
   APPLY NODE STYLES BY ID — V7 (TARGETED)
   🎯 For applying styles to specific nodes by ID
============================================================ */

/**
 * Applies AI-generated styles to specific nodes by ID.
 * Use this when AI returns styles keyed by node ID.
 *
 * @param root - The blueprint tree root
 * @param idStyles - Map of node ID → styles
 */
export function applyNodeStylesById(
  root: BlueprintNode,
  idStyles: Record<string, Record<string, any>>
): BlueprintNode {
  function walk(node: BlueprintNode): BlueprintNode {
    const aiStyle = idStyles[node.id];

    let nextProps = node.props ?? {};

    if (aiStyle && Object.keys(aiStyle).length > 0) {
      const safeStyle = filterSafeStyles(aiStyle);

      const existingStyle = node.props?.style ?? {};
      const inspectorStyle = node.props?.__inspectorStyle ?? {};

      nextProps = {
        ...node.props,
        style: {
          ...existingStyle,
          ...safeStyle,
          ...inspectorStyle,
        },
      };
    }

    return {
      ...node,
      props: nextProps,
      children: node.children?.map(walk) ?? [],
    };
  }

  return walk(structuredClone(root));
}

/* ============================================================
   APPLY VISUAL EFFECTS — V7 (ENHANCEMENT)
   🎨 Applies rich visual effects based on node props
============================================================ */

/**
 * Applies visual effects like gradients, shadows, glass morphism
 * based on node props (visual, backgroundVariant, emphasis, etc.)
 *
 * This runs AFTER intentCompiler and ensures visual intents
 * are translated into actual CSS styles.
 *
 * @param root - The blueprint tree root
 * @param designTokens - Design tokens for brand-aware styling
 */
export function applyVisualEffects(
  root: BlueprintNode,
  designTokens?: {
    colors?: Record<string, string>;
    shadows?: Record<string, string>;
  }
): BlueprintNode {
  const colors = designTokens?.colors ?? {};
  const primary = colors.primary ?? "#2563eb";
  const accent = colors.accent ?? "#6366f1";
  const background = colors.background ?? "#ffffff";
  const surface = colors.surface ?? "#f8fafc";
  const textPrimary = colors.textPrimary ?? "#0f172a";
  const border = colors.border ?? "#e2e8f0";

  function walk(node: BlueprintNode): BlueprintNode {
    let style: Record<string, any> = { ...(node.props?.style ?? {}) };
    let propsToAdd: Record<string, any> = {};

    /* ----------------------------------------------------------
       SECTION BACKGROUND VARIANTS
    ---------------------------------------------------------- */
    if (node.type === "section") {
      const variant = node.props?.backgroundVariant;

      switch (variant) {
        case "hero":
          style.background = `linear-gradient(180deg, ${primary}15 0%, ${background} 100%)`;
          break;

        case "gradient":
          style.background = `linear-gradient(135deg, ${primary}20 0%, ${accent}15 50%, ${background} 100%)`;
          break;

        case "gradient-radial":
          style.background = `radial-gradient(ellipse at center, ${primary}12 0%, ${background} 70%)`;
          break;

        case "dark":
          style.background = textPrimary;
          style.color = background;
          propsToAdd.__darkSection = true;
          break;

        case "light":
          style.background = surface;
          break;

        case "muted":
          style.background = `${surface}`;
          style.borderTop = `1px solid ${border}`;
          style.borderBottom = `1px solid ${border}`;
          break;

        case "solid":
          style.background = primary;
          style.color = colors.onPrimary ?? "#ffffff";
          propsToAdd.__darkSection = true;
          break;

        case "transparent":
          style.background = "transparent";
          break;
      }
    }

    /* ----------------------------------------------------------
       CONTAINER VISUAL VARIANTS
    ---------------------------------------------------------- */
    if (node.type === "container" || node.type === "column") {
      const visual = node.props?.visual;

      switch (visual) {
        case "card":
          style.background = surface;
          style.borderRadius = 16;
          style.border = `1px solid ${border}`;
          style.boxShadow = "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)";
          style.padding = node.props?.padding ?? 24;
          break;

        case "glass":
          style.background = "rgba(255,255,255,0.08)";
          style.backdropFilter = "blur(16px)";
          style.WebkitBackdropFilter = "blur(16px)";
          style.borderRadius = 20;
          style.border = "1px solid rgba(255,255,255,0.15)";
          style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)";
          style.padding = node.props?.padding ?? 32;
          break;

        case "elevated":
          style.background = background;
          style.borderRadius = 12;
          style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)";
          style.padding = node.props?.padding ?? 24;
          break;

        case "bordered":
          style.border = `2px solid ${border}`;
          style.borderRadius = 12;
          style.padding = node.props?.padding ?? 24;
          break;
      }
    }

    /* ----------------------------------------------------------
       HEADING EFFECTS
    ---------------------------------------------------------- */
    if (node.type === "heading") {
      const emphasis = node.props?.emphasis;

      switch (emphasis) {
        case "gradient":
          style.background = `linear-gradient(135deg, ${primary}, ${accent})`;
          style.WebkitBackgroundClip = "text";
          style.backgroundClip = "text";
          style.color = "transparent";
          break;

        case "bold":
          style.fontWeight = 800;
          style.letterSpacing = "-0.02em";
          break;

        case "light":
          style.fontWeight = 300;
          style.letterSpacing = "0.01em";
          break;
      }
    }

    /* ----------------------------------------------------------
       BUTTON VARIANTS
    ---------------------------------------------------------- */
    if (node.type === "button") {
      const variant = node.props?.variant;

      switch (variant) {
        case "primary":
          style.background = primary;
          style.color = colors.onPrimary ?? "#ffffff";
          style.border = "none";
          style.boxShadow = `0 1px 2px rgba(0,0,0,0.05)`;
          break;

        case "secondary":
          style.background = "transparent";
          style.color = primary;
          style.border = `2px solid ${primary}`;
          break;

        case "ghost":
          style.background = "transparent";
          style.color = textPrimary;
          style.border = "none";
          break;

        case "gradient":
          style.background = `linear-gradient(135deg, ${primary}, ${accent})`;
          style.color = "#ffffff";
          style.border = "none";
          style.boxShadow = `0 4px 14px ${primary}40`;
          break;
      }
    }

    /* ----------------------------------------------------------
       IMAGE EFFECTS
    ---------------------------------------------------------- */
    if (node.type === "image") {
      const effect = node.props?.effect;

      switch (effect) {
        case "shadow":
          style.boxShadow = "0 25px 50px -12px rgba(0,0,0,0.25)";
          break;

        case "border":
          style.border = `4px solid ${background}`;
          style.boxShadow = "0 10px 40px rgba(0,0,0,0.15)";
          break;

        case "glow":
          style.boxShadow = `0 0 60px ${primary}30`;
          break;
      }
    }

    /* ----------------------------------------------------------
       RETURN UPDATED NODE
    ---------------------------------------------------------- */
    const hasStyleChanges = Object.keys(style).length > 0;
    const hasPropsChanges = Object.keys(propsToAdd).length > 0;

    if (!hasStyleChanges && !hasPropsChanges) {
      return {
        ...node,
        children: node.children?.map(walk) ?? [],
      };
    }

    return {
      ...node,
      props: {
        ...node.props,
        ...propsToAdd,
        style: {
          ...(node.props?.style ?? {}),
          ...style,
          ...(node.props?.__inspectorStyle ?? {}),
        },
      },
      children: node.children?.map(walk) ?? [],
    };
  }

  return walk(structuredClone(root));
}