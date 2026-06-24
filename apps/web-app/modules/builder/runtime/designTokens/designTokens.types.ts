// /Users/kailash/buildez/apps/web-app/modules/builder/runtime/designTokens/designTokens.types.ts

/* ============================================================
   CANONICAL DESIGN TOKENS — V7 (LOCKED)
   
   Source of truth for:
   - AI design generation
   - Blueprint normalization
   - Runtime style resolution
   - Renderer CSS output
   
   Structure matches Tailwind CSS scale for familiarity.
============================================================ */

export interface DesignTokens {
  /* ----------------------------------------------------------
     COLORS (Semantic + Brand)
  ---------------------------------------------------------- */
  colors: {
    // Base surfaces
    background: string;        // Page background (#ffffff)
    surface: string;           // Cards/elevated surfaces (#f8fafc)
    muted?: string;            // Subtle backgrounds (#f1f5f9)
    
    // Text (accessibility-first)
    textPrimary: string;       // Main text (#0f172a)
    textSecondary: string;     // Muted text (#475569)
    textTertiary?: string;     // Very muted text (#94a3b8)
    onBackground?: string;     // 🔒 Guaranteed readable on background (alias of textPrimary)
    
    // Borders
    border: string;            // Default border (#e2e8f0)
    borderHover?: string;      // Hover state (#cbd5e1)
    
    // Brand colors
    primary: string;           // Primary brand color (#2563eb)
    primaryHover: string;      // Hover state (#1d4ed8)
    primaryLight?: string;     // Light variant (#dbeafe)
    onPrimary: string;         // 🔒 Guaranteed readable on primary (#ffffff)
    
    accent: string;            // Secondary brand color (#6366f1)
    accentHover?: string;      // Hover state (#4f46e5)
    onAccent?: string;         // 🔒 Guaranteed readable on accent (#ffffff)
    
    // Status colors (optional)
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
  };

  /* ----------------------------------------------------------
     TYPOGRAPHY
  ---------------------------------------------------------- */
  typography: {
    fontFamily: string;        // Base font stack
    
    // Font sizes (numeric values in px)
    fontSize: {
      xs?: number;             // 12px
      sm?: number;             // 14px
      base?: number;           // 16px
      lg?: number;             // 18px
      xl?: number;             // 20px
      "2xl"?: number;          // 24px
      "3xl"?: number;          // 30px
      "4xl"?: number;          // 36px
      "5xl"?: number;          // 48px
      "6xl"?: number;          // 60px
      "7xl"?: number;          // 72px
      "8xl"?: number;          // 96px
      "9xl"?: number;          // 128px
    };
    
    // Font weights
    fontWeight: {
      thin?: number;           // 100
      extralight?: number;     // 200
      light?: number;          // 300
      normal?: number;         // 400
      medium?: number;         // 500
      semibold?: number;       // 600
      bold?: number;           // 700
      extrabold?: number;      // 800
      black?: number;          // 900
    };
    
    // Line heights
    lineHeight: {
      none?: number;           // 1
      tight?: number;          // 1.25
      snug?: number;           // 1.375
      normal?: number;         // 1.5
      relaxed?: number;        // 1.625
      loose?: number;          // 2
    };
    
    // Letter spacing
    letterSpacing: {
      tighter?: string;        // -0.05em
      tight?: string;          // -0.025em
      normal?: string;         // 0em
      wide?: string;           // 0.025em
      wider?: string;          // 0.05em
      widest?: string;         // 0.1em
    };
    
    // Legacy support (deprecated - remove in v8)
    heading?: {
      fontFamily?: string;
      fontWeight?: number;
      letterSpacing?: string;
    };
    body?: {
      fontWeight?: number;
      lineHeight?: number;
    };
  };

  /* ----------------------------------------------------------
     SPACING (Tailwind-compatible scale)
     Numeric keys map to px values
  ---------------------------------------------------------- */
  spacing: {
    "0"?: number;              // 0px
    "1"?: number;              // 4px
    "2"?: number;              // 8px
    "3"?: number;              // 12px
    "4"?: number;              // 16px
    "5"?: number;              // 20px
    "6"?: number;              // 24px
    "7"?: number;              // 28px
    "8"?: number;              // 32px
    "9"?: number;              // 36px
    "10"?: number;             // 40px
    "12"?: number;             // 48px
    "14"?: number;             // 56px
    "16"?: number;             // 64px
    "20"?: number;             // 80px
    "24"?: number;             // 96px
    "28"?: number;             // 112px
    "32"?: number;             // 128px
    "36"?: number;             // 144px
    "40"?: number;             // 160px
    "48"?: number;             // 192px
    "56"?: number;             // 224px
    "64"?: number;             // 256px
    "72"?: number;             // 288px
    "80"?: number;             // 320px
    "96"?: number;             // 384px
    
    // Allow any string key for custom spacing
    [key: string]: number | undefined;
  };

  /* ----------------------------------------------------------
     SHADOWS (Tailwind-compatible)
  ---------------------------------------------------------- */
  shadows: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    "2xl"?: string;
    inner?: string;
    none?: string;
    
    // Semantic shadows
    card?: string;             // Default card shadow
    elevated?: string;         // Elevated elements
    hover?: string;            // Hover state shadow
    
    [key: string]: string | undefined;
  };

  /* ----------------------------------------------------------
     BORDER RADIUS (Tailwind-compatible)
  ---------------------------------------------------------- */
  radius: {
    none?: number;             // 0
    sm?: number;               // 8px
    md?: number;               // 12px
    lg?: number;               // 16px
    xl?: number;               // 20px
    "2xl"?: number;            // 24px
    "3xl"?: number;            // 32px
    full?: number;             // 9999px
    
    [key: string]: number | undefined;
  };

  /* ----------------------------------------------------------
     BUTTONS (Legacy - use spacing/radius instead)
  ---------------------------------------------------------- */
  buttons?: {
    radius?: number;
    paddingY?: number;
    paddingX?: number;
  };

  /* ----------------------------------------------------------
     TRANSITIONS (Optional)
  ---------------------------------------------------------- */
  transitions?: {
    fast?: string;             // 150ms ease
    base?: string;             // 200ms ease
    slow?: string;             // 300ms ease
    bounce?: string;           // cubic-bezier
    
    [key: string]: string | undefined;
  };

  /* ----------------------------------------------------------
     Z-INDEX (Optional)
  ---------------------------------------------------------- */
  zIndex?: {
    dropdown?: number;
    sticky?: number;
    fixed?: number;
    modalBackdrop?: number;
    modal?: number;
    popover?: number;
    tooltip?: number;
    
    [key: string]: number | undefined;
  };
}

/* ============================================================
   TYPE GUARDS
============================================================ */

/**
 * Check if design tokens are valid
 */
export function isValidDesignTokens(tokens: any): tokens is DesignTokens {
  return !!(
    tokens &&
    typeof tokens === "object" &&
    tokens.colors &&
    tokens.typography &&
    tokens.spacing
  );
}

/**
 * Get spacing value safely
 */
export function getSpacingValue(
  tokens: DesignTokens,
  key: string | number,
  fallback: number
): number {
  const value = tokens.spacing[String(key)];
  return typeof value === "number" ? value : fallback;
}

/**
 * Get font size safely
 */
export function getFontSizeValue(
  tokens: DesignTokens,
  key: string,
  fallback: number
): number {
  const value = tokens.typography.fontSize?.[key];
  return typeof value === "number" ? value : fallback;
}

/**
 * Get shadow safely
 */
export function getShadowValue(
  tokens: DesignTokens,
  key: string,
  fallback: string
): string {
  const value = tokens.shadows?.[key];
  return typeof value === "string" ? value : fallback;
}

/**
 * Get radius safely
 */
export function getRadiusValue(
  tokens: DesignTokens,
  key: string,
  fallback: number
): number {
  const value = tokens.radius?.[key];
  return typeof value === "number" ? value : fallback;
}
