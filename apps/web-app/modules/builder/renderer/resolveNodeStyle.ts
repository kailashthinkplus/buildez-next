// /Users/kailash/buildez/apps/web-app/modules/builder/renderer/resolveNodeStyle.ts

import type { CSSProperties } from "react";

/* ============================================================
   TYPES
============================================================ */

export interface BlueprintNode {
  id: string;
  type: string;
  props?: Record<string, any>;
  children?: BlueprintNode[];
}

type Device = "desktop" | "tablet" | "mobile";

interface PageTokens {
  colors?: Record<string, string>;
  typography?: Record<string, any>;
  spacing?: Record<string, number>;
  buttons?: Record<string, number>;
  shadows?: Record<string, string>;
}

/* ============================================================
   HELPER: HEX TO RGBA
============================================================ */

function hexToRgba(hex: string, alpha: number): string {
  // Handle both #RGB and #RRGGBB
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
    return hex; // Invalid hex, return as-is
  }
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ============================================================
   DEFAULT SYSTEM RHYTHM
============================================================ */

const DEFAULT_STYLE: Record<string, CSSProperties> = {
  page: {
    paddingTop: 0,
    paddingBottom: 0,
  },

  section: {
    width: "100%",
    paddingTop: 80,
    paddingBottom: 80,
    boxSizing: "border-box",
    position: "relative",
  },

  container: {
    width: "100%",
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: 24,
    paddingRight: 24,
    display: "flex",
    flexDirection: "column",
    gap: 24,
    boxSizing: "border-box",
    position: "relative",
  },

  column: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    minWidth: 0,
    boxSizing: "border-box",
    position: "relative",
  },

  heading: {
    display: "block",
    margin: 0,
    marginBottom: 16,
  },

  text: {
    display: "block",
    margin: 0,
    marginBottom: 12,
  },

  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    gap: 8,
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 28,
    paddingRight: 28,
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 16,
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "none",
  },

  image: {
    display: "block",
    maxWidth: "100%",
    height: "auto",
  },

  icon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },

  spacer: {},

  divider: {
    width: "100%",
    height: 1,
    marginTop: 24,
    marginBottom: 24,
  },
};

/* ============================================================
   RESPONSIVE OVERRIDES
============================================================ */

const RESPONSIVE: Record<Device, Record<string, CSSProperties>> = {
  desktop: {},

  tablet: {
    section: {
      paddingTop: 64,
      paddingBottom: 64,
    },
    container: {
      paddingLeft: 20,
      paddingRight: 20,
      gap: 20,
    },
    column: {
      gap: 14,
    },
    heading: {
      marginBottom: 14,
    },
  },

  mobile: {
    section: {
      paddingTop: 48,
      paddingBottom: 48,
    },
    container: {
      paddingLeft: 16,
      paddingRight: 16,
      gap: 16,
      flexDirection: "column",
    },
    column: {
      gap: 12,
      width: "100%",
      flex: "none",
    },
    heading: {
      marginBottom: 12,
    },
    button: {
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 20,
      paddingRight: 20,
      fontSize: 14,
    },
  },
};

/* ============================================================
   HEADING SIZE PRESETS
============================================================ */

const HEADING_SIZES: Record<string, Record<Device, CSSProperties>> = {
  h1: {
    desktop: { fontSize: 48, lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.02em" },
    tablet: { fontSize: 40, lineHeight: 1.15, fontWeight: 700, letterSpacing: "-0.02em" },
    mobile: { fontSize: 32, lineHeight: 1.2, fontWeight: 700, letterSpacing: "-0.01em" },
  },
  h2: {
    desktop: { fontSize: 36, lineHeight: 1.2, fontWeight: 600, letterSpacing: "-0.01em" },
    tablet: { fontSize: 30, lineHeight: 1.25, fontWeight: 600, letterSpacing: "-0.01em" },
    mobile: { fontSize: 26, lineHeight: 1.3, fontWeight: 600, letterSpacing: "0" },
  },
  h3: {
    desktop: { fontSize: 24, lineHeight: 1.3, fontWeight: 600, letterSpacing: "0" },
    tablet: { fontSize: 22, lineHeight: 1.35, fontWeight: 600, letterSpacing: "0" },
    mobile: { fontSize: 20, lineHeight: 1.4, fontWeight: 600, letterSpacing: "0" },
  },
  h4: {
    desktop: { fontSize: 20, lineHeight: 1.4, fontWeight: 600, letterSpacing: "0" },
    tablet: { fontSize: 18, lineHeight: 1.4, fontWeight: 600, letterSpacing: "0" },
    mobile: { fontSize: 18, lineHeight: 1.4, fontWeight: 600, letterSpacing: "0" },
  },
};

/* ============================================================
   TEXT ROLE PRESETS
============================================================ */

const TEXT_ROLES: Record<string, CSSProperties> = {
  lead: {
    fontSize: 20,
    lineHeight: 1.6,
    opacity: 0.9,
  },
  body: {
    fontSize: 16,
    lineHeight: 1.7,
    opacity: 0.85,
  },
  caption: {
    fontSize: 14,
    lineHeight: 1.5,
    opacity: 0.7,
  },
  subheading: {
    fontSize: 14,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    opacity: 0.7,
    marginBottom: 12,
  },
};

/* ============================================================
   MAIN RESOLVER
============================================================ */

export function resolveNodeStyle(
  node: BlueprintNode,
  device: Device = "desktop",
  pageTokens?: PageTokens
): CSSProperties {
  const style: CSSProperties = {};

  // ✅ Extract all style sources upfront
  const aiGeneratedStyles = node.props?.__aiGeneratedStyles ?? {};
  const aiStyle = node.props?.style ?? {};
  const inspectorStyle = node.props?.__inspectorStyle ?? {};

  // ✅ Extract design tokens (from pageTokens OR node)
  const nodeTokens = node.props?.designTokens;
  const colors = pageTokens?.colors ?? nodeTokens?.colors ?? {};
  const typography = pageTokens?.typography ?? nodeTokens?.typography ?? {};
  const spacing = pageTokens?.spacing ?? nodeTokens?.spacing ?? {};
  const shadows = pageTokens?.shadows ?? nodeTokens?.shadows ?? {};

  // Color palette with defaults
  const primary = colors.primary ?? "#2563eb";
  const primaryHover = colors.primaryHover ?? "#1d4ed8";
  const accent = colors.accent ?? "#6366f1";
  const background = colors.background ?? "#ffffff";
  const surface = colors.surface ?? "#f8fafc";
  const textPrimary = colors.textPrimary ?? "#0f172a";
  const textSecondary = colors.textSecondary ?? "#475569";
  const border = colors.border ?? "#e2e8f0";
  const onPrimary = colors.onPrimary ?? "#ffffff";

  /* ----------------------------------------------------------
     1️⃣ SYSTEM DEFAULTS
  ---------------------------------------------------------- */

  Object.assign(style, DEFAULT_STYLE[node.type] ?? {});

  /* ----------------------------------------------------------
     2️⃣ RESPONSIVE DEFAULTS
  ---------------------------------------------------------- */

  const responsive = RESPONSIVE[device]?.[node.type];
  if (responsive) Object.assign(style, responsive);

  /* ----------------------------------------------------------
     3️⃣ CHECK IF AI ALREADY SET CRITICAL STYLES
  ---------------------------------------------------------- */

  const aiHasBackground = !!(aiStyle.background || aiGeneratedStyles.background);
  const aiHasColor = !!(aiStyle.color || aiGeneratedStyles.color);
  const aiHasPadding = !!(aiStyle.padding || aiGeneratedStyles.padding);

  /* ----------------------------------------------------------
     4️⃣ STRUCTURAL RULES
  ---------------------------------------------------------- */

  switch (node.type) {
    case "container": {
      const layout = node.props?.layout;
      const isColumns = layout === "columns";
      const isGrid = layout === "grid";
      const isMobile = device === "mobile";

      if (isGrid) {
        style.display = "grid";
        style.gridTemplateColumns = isMobile 
          ? "1fr" 
          : `repeat(${node.props?.columns ?? 3}, 1fr)`;
        delete style.flexDirection;
      } else {
        style.display = "flex";
        style.flexDirection = (isColumns && !isMobile) ? "row" : "column";
      }

      if (node.props?.gap != null) {
        style.gap = node.props.gap;
      }

      if (node.props?.maxWidth != null) {
        style.maxWidth = node.props.maxWidth;
        style.marginLeft = "auto";
        style.marginRight = "auto";
      }

      if (node.props?.align) {
        style.alignItems = node.props.align;
      }

      if (node.props?.justify) {
        const justify = node.props.justify;
        style.justifyContent = 
          justify === "between" ? "space-between" :
          justify === "around" ? "space-around" :
          justify;
      }
      break;
    }

    case "column": {
      const isMobile = device === "mobile";
      
      if (isMobile) {
        style.flex = "none";
        style.width = "100%";
      } else if (node.props?.width) {
        style.flex = "0 0 auto";
        style.width = node.props.width;
      } else if (node.props?.flex) {
        style.flex = node.props.flex;
      } else {
        style.flex = "1 1 0%";
      }

      if (node.props?.align) {
        style.alignItems =
          node.props.align === "center" ? "center" :
          node.props.align === "end" ? "flex-end" :
          "flex-start";
      }

      if (node.props?.justify) {
        style.justifyContent = node.props.justify;
      }
      break;
    }
  }

  /* ----------------------------------------------------------
     5️⃣ SEMANTIC BACKGROUNDS (Only if AI didn't set)
  ---------------------------------------------------------- */

  if (
    !aiHasBackground &&
    node.type === "section" &&
    node.props?.role !== "header" &&
    node.props?.role !== "footer"
  ) {
    const variant = node.props?.backgroundVariant;

    switch (variant) {
      case "gradient":
        style.background = `linear-gradient(135deg, ${primary} 0%, ${accent} 50%, ${background} 100%)`;
        break;

      case "gradient-radial":
        style.background = `radial-gradient(ellipse at center, ${hexToRgba(primary, 0.12)} 0%, ${background} 70%)`;
        break;

      case "dark":
        style.background = textPrimary;
        style.color = background;
        break;

      case "light":
        style.background = surface;
        break;

      case "muted":
        style.background = surface;
        style.borderTop = `1px solid ${border}`;
        style.borderBottom = `1px solid ${border}`;
        break;

      case "solid":
        style.background = primary;
        style.color = onPrimary;
        break;

      case "transparent":
        style.background = "transparent";
        break;
    }
  }

  /* ----------------------------------------------------------
     6️⃣ VISUAL EFFECTS (Only if AI didn't set)
  ---------------------------------------------------------- */

  if (!aiHasBackground && (node.type === "container" || node.type === "column")) {
    const visual = node.props?.visual;

    switch (visual) {
      case "card":
        style.background = background;
        style.borderRadius = 16;
        style.border = `1px solid ${border}`;
        style.boxShadow = shadows.card ?? "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)";
        if (!aiHasPadding) style.padding = 32;
        break;

      case "glass":
        style.background = "rgba(255,255,255,0.08)";
        style.backdropFilter = "blur(16px)";
        (style as any).WebkitBackdropFilter = "blur(16px)";
        style.borderRadius = 20;
        style.border = "1px solid rgba(255,255,255,0.15)";
        style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)";
        if (!aiHasPadding) style.padding = 32;
        break;

      case "elevated":
        style.background = background;
        style.borderRadius = 12;
        style.boxShadow = shadows.elevated ?? "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)";
        if (!aiHasPadding) style.padding = 24;
        break;

      case "bordered":
        style.border = `2px solid ${border}`;
        style.borderRadius = 12;
        if (!aiHasPadding) style.padding = 24;
        break;

      case "soft":
        style.background = hexToRgba(primary, 0.08);
        style.borderRadius = 16;
        if (!aiHasPadding) style.padding = 24;
        break;

      case "gradient":
        style.background = `linear-gradient(135deg, ${primary}, ${accent})`;
        style.borderRadius = 20;
        style.color = "#ffffff";
        if (!aiHasPadding) style.padding = 32;
        break;
    }
  }

  /* ----------------------------------------------------------
     7️⃣ HEADING STYLES
  ---------------------------------------------------------- */

  if (node.type === "heading") {
    const level = node.props?.level ?? "h2";
    const sizePreset = HEADING_SIZES[level]?.[device] ?? HEADING_SIZES.h2[device];
    Object.assign(style, sizePreset);

    if (typography.heading) {
      if (typography.heading.fontWeight) style.fontWeight = typography.heading.fontWeight;
      if (typography.heading.letterSpacing) style.letterSpacing = typography.heading.letterSpacing;
      if (typography.heading.fontFamily) style.fontFamily = typography.heading.fontFamily;
    }

    const emphasis = node.props?.emphasis;

    switch (emphasis) {
      case "gradient":
        style.background = `linear-gradient(135deg, ${primary}, ${accent})`;
        (style as any).WebkitBackgroundClip = "text";
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
     8️⃣ TEXT STYLES
  ---------------------------------------------------------- */

  if (node.type === "text") {
    const role = node.props?.role ?? "body";
    const roleStyle = TEXT_ROLES[role] ?? TEXT_ROLES.body;
    Object.assign(style, roleStyle);

    if (typography.body) {
      if (typography.body.lineHeight) style.lineHeight = typography.body.lineHeight;
      if (typography.body.fontWeight) style.fontWeight = typography.body.fontWeight;
    }

    if (!aiHasColor) {
      style.color = textSecondary;
    }
  }

  /* ----------------------------------------------------------
     9️⃣ BUTTON STYLES
  ---------------------------------------------------------- */

  if (node.type === "button") {
    const variant = node.props?.variant ?? "primary";

    switch (variant) {
      case "primary":
        style.background = primary;
        style.color = onPrimary;
        style.boxShadow = "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)";
        break;

      case "secondary":
        style.background = "transparent";
        style.color = primary;
        style.border = `2px solid ${primary}`;
        break;

      case "ghost":
        style.background = "transparent";
        style.color = textPrimary;
        break;

      case "gradient":
        style.background = `linear-gradient(135deg, ${primary}, ${accent})`;
        style.color = "#ffffff";
        style.boxShadow = `0 4px 14px ${hexToRgba(primary, 0.4)}`;
        break;

      case "outline":
        style.background = "transparent";
        style.color = textPrimary;
        style.border = `2px solid ${border}`;
        break;
    }
  }

  /* ----------------------------------------------------------
     🔟 IMAGE STYLES
  ---------------------------------------------------------- */

  if (node.type === "image") {
    if (node.props?.radius != null) {
      style.borderRadius = node.props.radius;
      style.overflow = "hidden";
    }

    if (node.props?.aspectRatio != null) {
      style.aspectRatio = node.props.aspectRatio;
      style.objectFit = "cover";
    }

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
        style.boxShadow = `0 0 60px ${hexToRgba(primary, 0.3)}`;
        break;

      case "elevated":
        style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
        break;
    }
  }

  /* ----------------------------------------------------------
     1️⃣1️⃣ ICON STYLES
  ---------------------------------------------------------- */

  if (node.type === "icon") {
    const variant = node.props?.variant ?? "default";

    switch (variant) {
      case "default":
        style.color = primary;
        break;

      case "filled":
        style.backgroundColor = primary;
        style.color = onPrimary;
        style.padding = 12;
        style.borderRadius = 12;
        break;

      case "outlined":
        style.border = `2px solid ${primary}`;
        style.color = primary;
        style.padding = 12;
        style.borderRadius = 12;
        break;

      case "soft":
        style.backgroundColor = hexToRgba(primary, 0.15);
        style.color = primary;
        style.padding = 12;
        style.borderRadius = 12;
        break;

      case "gradient":
        style.background = `linear-gradient(135deg, ${primary}, ${accent})`;
        style.color = "#ffffff";
        style.padding = 12;
        style.borderRadius = 12;
        break;
    }
  }

  /* ----------------------------------------------------------
     1️⃣2️⃣ DIVIDER STYLES
  ---------------------------------------------------------- */

  if (node.type === "divider") {
    style.background = border;
    style.opacity = 0.5;
  }

  /* ----------------------------------------------------------
     1️⃣3️⃣ HEADER/FOOTER OVERRIDES
  ---------------------------------------------------------- */

  if (node.type === "section" && node.props?.role === "header") {
    style.background = "transparent";
    style.paddingTop = 16;
    style.paddingBottom = 16;
    style.position = "relative";
    style.zIndex = 100;
  }

  if (node.type === "section" && node.props?.role === "footer") {
    style.background = surface;
    style.paddingTop = 48;
    style.paddingBottom = 48;
    style.borderTop = `1px solid ${border}`;
  }

  /* ----------------------------------------------------------
     1️⃣4️⃣ DARK SECTION TEXT COLOR
  ---------------------------------------------------------- */

  if (!aiHasColor && node.props?.__darkSection) {
    if (node.type === "heading") {
      style.color = background;
    }
    if (node.type === "text") {
      style.color = hexToRgba(background, 0.8);
    }
  }

  /* ----------------------------------------------------------
     1️⃣5️⃣ MERGE AI STYLES (HIGH PRIORITY)
  ---------------------------------------------------------- */

  // ✅ Merge AI-generated styles BEFORE inspector
  Object.assign(style, aiGeneratedStyles);
  Object.assign(style, aiStyle);

  /* ----------------------------------------------------------
     1️⃣6️⃣ INSPECTOR OVERRIDES (FINAL AUTHORITY)
  ---------------------------------------------------------- */

  Object.assign(style, inspectorStyle);

  return style;
}

/* ============================================================
   HELPER EXPORTS
============================================================ */

export { HEADING_SIZES, TEXT_ROLES, DEFAULT_STYLE, RESPONSIVE };
