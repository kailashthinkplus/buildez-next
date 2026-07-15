// /apps/web-app/app/api/ai/_lib/branding/mapColorsToTokens.ts

import { DesignTokens } from
  "@/modules/builder/runtime/designTokens/designTokens.types";

import { ExtractedBrandColors } from "./extractBrandColors";

/* ============================================================
   COLOR HELPERS
============================================================ */

function hexToRgb(hex: string) {
  const n = hex.replace("#", "");
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

function isDark(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum < 0.5;
}

/* ============================================================
   CORE MAPPING
============================================================ */

export function mapColorsToDesignTokens(
  colors: ExtractedBrandColors
): DesignTokens {
  const darkBg = colors.backgroundHint === "dark";

  return {
    colors: {
      background: darkBg ? "#020617" : "#ffffff",
      surface: darkBg ? "#020617" : "#f8fafc",

      textPrimary: darkBg ? "#f8fafc" : "#020617",
      textSecondary: darkBg ? "#cbd5f5" : "#475569",

      border: darkBg ? "#1e293b" : "#e5e7eb",

      primary: colors.primary,
      primaryHover: colors.primary,
      onPrimary: isDark(colors.primary) ? "#ffffff" : "#020617",

      accent: colors.accent,
    },

    typography: {
      fontFamily:
        "system-ui,-apple-system,BlinkMacSystemFont,sans-serif",

      heading: {
        fontWeight: 700,
      },

      body: {
        fontWeight: 400,
        lineHeight: 1.6,
      },
    },

    spacing: {
      sectionY: 96,
      containerX: 24,
      blockGap: 16,
      radius: 12,
    },

    buttons: {
      radius: 10,
      paddingX: 20,
      paddingY: 12,
    },
  };
}
