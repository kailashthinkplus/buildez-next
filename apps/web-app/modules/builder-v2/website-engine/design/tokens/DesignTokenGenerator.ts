import type { WebsiteSpec } from "../../specification";
import type { WebsiteDesignTokens } from "./types";

export function generateDesignTokens(spec: WebsiteSpec): WebsiteDesignTokens {
  if (spec.business.industry === "real-estate") {
    return {
      colors: {
        background: "#f7f3ec",
        surface: "#fffdf8",
        surfaceAlt: "#e9dfd0",
        textPrimary: "#1f2a24",
        textSecondary: "#5d675f",
        primary: "#234c3f",
        primaryContrast: "#ffffff",
        accent: "#a7653f",
        border: "#d8cdbd",
      },
      typography: {
        headingFont: "Cormorant Garamond",
        bodyFont: "Instrument Sans",
        scale: {
          h1: 60,
          h2: 42,
          h3: 24,
          body: 16,
          small: 13,
        },
      },
      spacing: {
        sectionY: 96,
        containerX: 28,
        contentGap: 30,
        cardGap: 22,
      },
      radius: {
        button: 10,
        card: 12,
        media: 14,
      },
      shadow: {
        card: "0 18px 45px rgba(31, 42, 36, 0.10)",
        media: "0 28px 80px rgba(31, 42, 36, 0.18)",
      },
    };
  }

  return {
    colors: {
      background: "#f7f7f4",
      surface: "#ffffff",
      surfaceAlt: "#e9ece6",
      textPrimary: "#17231d",
      textSecondary: "#53635a",
      primary: "#0f766e",
      primaryContrast: "#ffffff",
      accent: "#8b5e34",
      border: "#d4ddd2",
    },
    typography: {
      headingFont: "Bricolage Grotesque",
      bodyFont: "Manrope",
      scale: {
        h1: 56,
        h2: 38,
        h3: 24,
        body: 16,
        small: 14,
      },
    },
    spacing: {
      sectionY: 88,
      containerX: 24,
      contentGap: 28,
      cardGap: 20,
    },
    radius: {
      button: 10,
      card: 12,
      media: 14,
    },
    shadow: {
      card: "0 16px 42px rgba(15, 23, 42, 0.08)",
      media: "0 24px 70px rgba(15, 23, 42, 0.16)",
    },
  };
}
