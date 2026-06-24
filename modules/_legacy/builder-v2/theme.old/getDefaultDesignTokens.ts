// /modules/builder/theme/getDefaultDesignTokens.ts

import { DesignTokens } from "./designTokens";

export function getDefaultDesignTokens(): DesignTokens {
  return {
    brand: {
      primaryColor: "#2563EB",
      secondaryColor: "#0F172A",
      accentColor: "#22C55E",
      textOnPrimary: "#FFFFFF",
      brandStyle: "neutral",
    },

    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      scale: "balanced",
      headingWeights: {
        h1: 700,
        h2: 600,
        h3: 600,
      },
      baseLineHeight: 1.6,
    },

    spacing: {
      sectionPadding: "comfortable",
      blockGap: 24,
      containerMaxWidths: {
        text: 640,
        default: 1200,
      },
    },
  };
}
