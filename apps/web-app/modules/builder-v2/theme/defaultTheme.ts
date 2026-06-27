import type { BuilderTheme } from "../types/blueprint";
import type {
  BuilderThemeTokens,
  ThemePreset,
  ThemeTokenPatch,
} from "./theme.types";

export const defaultThemeTokens: BuilderThemeTokens = {
  colors: {
    background: "#f8fafc",
    surface: "#ffffff",
    surfaceAlt: "#eef2f7",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    primary: "#2563eb",
    primaryContrast: "#ffffff",
    accent: "#f97316",
    border: "#dbe3ef",
  },
  typography: {
    headingFont: "Inter",
    bodyFont: "Inter",
    baseSize: 16,
    scale: {
      h1: 56,
      h2: 40,
      h3: 28,
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
  buttons: {
    primary: {
      backgroundColor: "#2563eb",
      color: "#ffffff",
      borderRadius: 10,
    },
    secondary: {
      backgroundColor: "transparent",
      color: "#0f172a",
      borderColor: "#cbd5e1",
      borderRadius: 10,
    },
  },
};

export const defaultThemePreset: ThemePreset = {
  id: "buildez-default",
  name: "BuildEZ Default",
  tone: "professional",
  previewImageUrl: "/theme-previews/buildez-default.png",
  demoData: {
    category: "Business starter",
    audience: "Consultants, agencies, and service teams",
    description:
      "A clean multi-purpose website starter with a polished workspace hero, trust metrics, and service cards.",
    sections: ["Hero", "Proof strip", "Services", "CTA"],
    highlights: ["Workspace imagery", "Metric cards", "Balanced business layout"],
  },
  tokens: defaultThemeTokens,
};

export function mergeThemeTokens(
  base: BuilderThemeTokens,
  patch?: ThemeTokenPatch
): BuilderThemeTokens {
  if (!patch) return structuredClone(base);

  return {
    colors: { ...base.colors, ...patch.colors },
    typography: {
      ...base.typography,
      ...patch.typography,
      scale: {
        ...base.typography.scale,
        ...patch.typography?.scale,
      },
    },
    spacing: { ...base.spacing, ...patch.spacing },
    radius: { ...base.radius, ...patch.radius },
    shadow: { ...base.shadow, ...patch.shadow },
    buttons: {
      primary: {
        ...base.buttons.primary,
        ...patch.buttons?.primary,
      },
      secondary: {
        ...base.buttons.secondary,
        ...patch.buttons?.secondary,
      },
    },
  };
}

export function createBuilderTheme(
  preset: ThemePreset = defaultThemePreset,
  patch?: ThemeTokenPatch
): BuilderTheme {
  return {
    id: preset.id,
    name: preset.name,
    preset: preset.id,
    tokens: mergeThemeTokens(preset.tokens, patch) as unknown as Record<string, unknown>,
  };
}
