import { DesignTokens } from
  "@/modules/builder/runtime/designTokens/designTokens.types";

/* ============================================================
   DEFAULT DESIGN TOKENS (SERVER ONLY)
============================================================ */

export function getDefaultDesignTokens(): DesignTokens {
  return {
    colors: {
      background: "#020617",
      surface: "#020617",
      textPrimary: "#e5e7eb",
      textSecondary: "#9ca3af",
      border: "rgba(255,255,255,0.08)",

      primary: "#3b82f6",
      primaryHover: "#2563eb",
      onPrimary: "#ffffff",
    },

    typography: {
      fontFamily:
        "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",

      heading: {
        fontWeight: 600,
        letterSpacing: "-0.01em",
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
      paddingY: 12,
      paddingX: 20,
    },
  };
}
