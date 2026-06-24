// /modules/builder/theme/designTokens.ts

export type BrandStyle =
  | "neutral"
  | "minimal"
  | "bold"
  | "premium";

export interface DesignTokens {
  brand?: {
    logoUrl?: string;

    primaryColor: string;
    secondaryColor?: string;
    accentColor?: string;

    textOnPrimary: string;
    brandStyle?: BrandStyle;
  };

  typography: {
    headingFont: string;
    bodyFont: string;

    scale: "compact" | "balanced" | "spacious";

    headingWeights: {
      h1: number;
      h2: number;
      h3: number;
    };

    baseLineHeight: number;
  };

  spacing: {
    sectionPadding: "tight" | "comfortable" | "airy";
    blockGap: 16 | 24 | 32;

    containerMaxWidths: {
      text: number;
      default: number;
    };
  };
}
