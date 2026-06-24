// /apps/web-app/app/api/ai/_lib/designTokens.ts

import type { DesignTokens } from "./designTokens";

export function generateDefaultDesignTokens(): DesignTokens {
  return {
    colors: {
      primary: "#2563EB",       // blue-600
      secondary: "#0F172A",     // slate-900
      accent: "#22C55E",        // green-500

      background: "#FFFFFF",
      surface: "#F8FAFC",       // slate-50
      textPrimary: "#020617",   // slate-950
      textSecondary: "#475569", // slate-600
      border: "#E2E8F0",        // slate-200
    },

    typography: {
      fontFamily: {
        heading: "Inter",
        body: "Inter",
      },

      scale: {
        h1: 48,
        h2: 36,
        h3: 28,
        h4: 22,
        body: 16,
        small: 14,
      },

      weight: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },

    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 40,
      section: 96,
    },

    radius: {
      sm: 6,
      md: 10,
      lg: 16,
    },
  };
}
