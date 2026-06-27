import type { BuilderThemeTokens, ThemePreset } from "./theme.types";
import { defaultThemePreset, defaultThemeTokens } from "./defaultTheme";

function withButtonTokens(tokens: BuilderThemeTokens): BuilderThemeTokens {
  return {
    ...tokens,
    buttons: {
      primary: {
        backgroundColor: tokens.colors.primary,
        color: tokens.colors.primaryContrast,
        borderRadius: tokens.radius.button,
      },
      secondary: {
        backgroundColor: "transparent",
        color: tokens.colors.textPrimary,
        borderColor: tokens.colors.border,
        borderRadius: tokens.radius.button,
      },
    },
  };
}

export const firstPartyThemePresets: ThemePreset[] = [
  defaultThemePreset,
  {
    id: "modern-saas",
    name: "Modern SaaS",
    tone: "professional",
    previewImageUrl: "/theme-previews/modern-saas.png",
    demoData: {
      category: "SaaS dashboard",
      audience: "B2B software, analytics, and product-led teams",
      description:
        "A conversion-focused SaaS template with dashboard imagery, KPI proof, and product feature cards.",
      sections: ["Hero dashboard", "KPI strip", "Feature grid", "Trial CTA"],
      highlights: ["Analytics demo data", "Glass UI panels", "Crisp product layout"],
    },
    tokens: withButtonTokens({
      ...defaultThemeTokens,
      colors: {
        background: "#edf7ff",
        surface: "#ffffff",
        surfaceAlt: "#dff4ff",
        textPrimary: "#081f36",
        textSecondary: "#46627a",
        primary: "#0284c7",
        primaryContrast: "#ffffff",
        accent: "#10b981",
        border: "#bfd9ec",
      },
      typography: {
        ...defaultThemeTokens.typography,
        headingFont: "Inter",
        bodyFont: "Inter",
      },
      radius: { button: 8, card: 8, media: 10 },
      shadow: {
        card: "0 14px 36px rgba(16, 32, 51, 0.08)",
        media: "0 24px 68px rgba(14, 165, 233, 0.16)",
      },
    }),
  },
  {
    id: "premium-studio",
    name: "Premium Studio",
    tone: "premium",
    previewImageUrl: "/theme-previews/premium-studio.png",
    demoData: {
      category: "Portfolio studio",
      audience: "Interior designers, photographers, and premium studios",
      description:
        "An editorial portfolio template with oversized project imagery, refined typography, and quiet luxury spacing.",
      sections: ["Editorial hero", "Project mosaic", "Services", "Inquiry CTA"],
      highlights: ["Gallery-led layout", "Serif display type", "Warm neutral imagery"],
    },
    tokens: withButtonTokens({
      ...defaultThemeTokens,
      colors: {
        background: "#f6f0e8",
        surface: "#fffdf9",
        surfaceAlt: "#e8dccd",
        textPrimary: "#201812",
        textSecondary: "#6f5f51",
        primary: "#5c3b25",
        primaryContrast: "#fffaf3",
        accent: "#c0945a",
        border: "#dacbb9",
      },
      typography: {
        ...defaultThemeTokens.typography,
        headingFont: "Playfair Display",
        bodyFont: "Inter",
      },
      radius: { button: 6, card: 8, media: 8 },
      shadow: {
        card: "0 18px 44px rgba(23, 20, 17, 0.10)",
        media: "0 26px 72px rgba(139, 94, 52, 0.20)",
      },
    }),
  },
  {
    id: "local-business",
    name: "Local Business",
    tone: "friendly",
    previewImageUrl: "/theme-previews/local-business.png",
    demoData: {
      category: "Local storefront",
      audience: "Cafes, florists, salons, clinics, and neighborhood shops",
      description:
        "A warm local business template with storefront imagery, opening details, reviews, and clear booking actions.",
      sections: ["Storefront hero", "Hours", "Featured offers", "Reviews"],
      highlights: ["Photo-first local feel", "Booking demo data", "Friendly service cards"],
    },
    tokens: withButtonTokens({
      ...defaultThemeTokens,
      colors: {
        background: "#fff7ed",
        surface: "#ffffff",
        surfaceAlt: "#f3ead6",
        textPrimary: "#243326",
        textSecondary: "#66715f",
        primary: "#2f7d4b",
        primaryContrast: "#ffffff",
        accent: "#d97706",
        border: "#ead8bd",
      },
      typography: {
        ...defaultThemeTokens.typography,
        headingFont: "Nunito",
        bodyFont: "Inter",
      },
      radius: { button: 10, card: 8, media: 10 },
      shadow: {
        card: "0 14px 34px rgba(24, 50, 38, 0.08)",
        media: "0 24px 64px rgba(22, 128, 60, 0.16)",
      },
    }),
  },
  {
    id: "bold-launch",
    name: "Bold Launch",
    tone: "bold",
    previewImageUrl: "/theme-previews/bold-launch.png",
    demoData: {
      category: "Launch campaign",
      audience: "Events, product drops, courses, and creator launches",
      description:
        "A high-energy launch template with dramatic hero art, countdown-style stats, and punchy conversion blocks.",
      sections: ["Launch hero", "Countdown stats", "Benefits", "Signup CTA"],
      highlights: ["Dark neon art", "High contrast sections", "Campaign demo copy"],
    },
    tokens: withButtonTokens({
      ...defaultThemeTokens,
      colors: {
        background: "#080b18",
        surface: "#11162a",
        surfaceAlt: "#1e2140",
        textPrimary: "#f8fafc",
        textSecondary: "#c9d2e4",
        primary: "#ff3f81",
        primaryContrast: "#ffffff",
        accent: "#7dd3fc",
        border: "#343a62",
      },
      typography: {
        ...defaultThemeTokens.typography,
        headingFont: "Poppins",
        bodyFont: "Inter",
      },
      spacing: {
        sectionY: 96,
        containerX: 28,
        contentGap: 32,
        cardGap: 22,
      },
      radius: { button: 8, card: 8, media: 12 },
      shadow: {
        card: "0 16px 38px rgba(33, 19, 11, 0.10)",
        media: "0 28px 76px rgba(239, 68, 68, 0.18)",
      },
    }),
  },
  {
    id: "editorial-minimal",
    name: "Editorial Minimal",
    tone: "professional",
    previewImageUrl: "/theme-previews/editorial-minimal.png",
    demoData: {
      category: "Editorial publication",
      audience: "Magazines, writers, research teams, and cultural projects",
      description:
        "A restrained editorial template with a magazine lead story, article rail, monochrome imagery, and precise spacing.",
      sections: ["Feature story", "Article rail", "Issue notes", "Subscribe"],
      highlights: ["Magazine demo data", "Asymmetric grid", "Minimal monochrome palette"],
    },
    tokens: withButtonTokens({
      ...defaultThemeTokens,
      colors: {
        background: "#f4f4f2",
        surface: "#ffffff",
        surfaceAlt: "#e6e6e2",
        textPrimary: "#111111",
        textSecondary: "#595959",
        primary: "#111111",
        primaryContrast: "#ffffff",
        accent: "#a33b20",
        border: "#cfcfca",
      },
      typography: {
        ...defaultThemeTokens.typography,
        headingFont: "Georgia",
        bodyFont: "Inter",
      },
      radius: { button: 4, card: 6, media: 6 },
      shadow: {
        card: "0 10px 26px rgba(24, 24, 27, 0.06)",
        media: "0 18px 48px rgba(24, 24, 27, 0.12)",
      },
    }),
  },
];

export function getThemePreset(presetId: string | null | undefined) {
  return (
    firstPartyThemePresets.find((preset) => preset.id === presetId) ??
    defaultThemePreset
  );
}
