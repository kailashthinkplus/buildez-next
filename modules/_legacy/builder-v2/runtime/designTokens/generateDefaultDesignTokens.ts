// /Users/kailash/buildez/apps/web-app/modules/builder/runtime/designTokens/generateDefaultDesignTokens.ts

import { DesignTokens } from "./designTokens.types";

/* ============================================================
   DEFAULT DESIGN TOKENS (FALLBACK)
   
   Structure matches what normalizer and resolveNodeStyle expect.
   Based on Tailwind CSS spacing/typography scale.
============================================================ */

export function generateDefaultDesignTokens(): DesignTokens {
  return {
    /* ----------------------------------------------------------
       COLORS
    ---------------------------------------------------------- */
    colors: {
      // Base
      background: "#ffffff",
      surface: "#f8fafc",
      muted: "#f1f5f9",
      
      // Text
      textPrimary: "#0f172a",     // slate-900
      textSecondary: "#475569",   // slate-600
      textTertiary: "#94a3b8",    // slate-400
      
      // Border
      border: "#e2e8f0",          // slate-200
      borderHover: "#cbd5e1",     // slate-300
      
      // Brand
      primary: "#2563eb",         // blue-600
      primaryHover: "#1d4ed8",    // blue-700
      primaryLight: "#dbeafe",    // blue-100
      onPrimary: "#ffffff",
      
      accent: "#6366f1",          // indigo-500
      accentHover: "#4f46e5",     // indigo-600
      onAccent: "#ffffff",
      
      // Status
      success: "#10b981",         // green-500
      warning: "#f59e0b",         // amber-500
      error: "#ef4444",           // red-500
      info: "#3b82f6",            // blue-500
    },

    /* ----------------------------------------------------------
       TYPOGRAPHY
    ---------------------------------------------------------- */
    typography: {
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      
      // Font sizes (matches Tailwind)
      fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        "2xl": 24,
        "3xl": 30,
        "4xl": 36,
        "5xl": 48,
        "6xl": 60,
        "7xl": 72,
        "8xl": 96,
        "9xl": 128,
      },
      
      // Font weights
      fontWeight: {
        thin: 100,
        extralight: 200,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
      },
      
      // Line heights
      lineHeight: {
        none: 1,
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2,
      },
      
      // Letter spacing
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0em",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
    },

    /* ----------------------------------------------------------
       SPACING (matches Tailwind scale)
    ---------------------------------------------------------- */
    spacing: {
      "0": 0,
      "1": 4,
      "2": 8,
      "3": 12,
      "4": 16,
      "5": 20,
      "6": 24,
      "7": 28,
      "8": 32,
      "9": 36,
      "10": 40,
      "11": 44,
      "12": 48,
      "14": 56,
      "16": 64,
      "20": 80,
      "24": 96,
      "28": 112,
      "32": 128,
      "36": 144,
      "40": 160,
      "44": 176,
      "48": 192,
      "52": 208,
      "56": 224,
      "60": 240,
      "64": 256,
      "72": 288,
      "80": 320,
      "96": 384,
    },

    /* ----------------------------------------------------------
       SHADOWS
    ---------------------------------------------------------- */
    shadows: {
      xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
      none: "none",
      
      // Semantic shadows
      card: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
      elevated: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      hover: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    },

    /* ----------------------------------------------------------
       BORDER RADIUS
    ---------------------------------------------------------- */
    radius: {
      none: 0,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      "2xl": 24,
      "3xl": 32,
      full: 9999,
    },

    /* ----------------------------------------------------------
       BUTTONS (deprecated - use spacing/radius instead)
    ---------------------------------------------------------- */
    buttons: {
      radius: 12,
      paddingY: 14,
      paddingX: 28,
    },

    /* ----------------------------------------------------------
       TRANSITIONS
    ---------------------------------------------------------- */
    transitions: {
      fast: "150ms ease",
      base: "200ms ease",
      slow: "300ms ease",
      bounce: "300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },

    /* ----------------------------------------------------------
       Z-INDEX
    ---------------------------------------------------------- */
    zIndex: {
      dropdown: 1000,
      sticky: 1020,
      fixed: 1030,
      modalBackdrop: 1040,
      modal: 1050,
      popover: 1060,
      tooltip: 1070,
    },
  };
}
