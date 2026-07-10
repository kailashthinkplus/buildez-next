import type { ColorProfile, DesignInput, DesignLanguageProfile } from "./designIntent";

const colorByLanguage: Record<string, Omit<ColorProfile, "behavior">> = {
  Clinical: { paletteName: "clinical calm", background: "#F8FAFC", foreground: "#172033", accent: "#2F6F7E", muted: "#E6EEF2" },
  Luxury: { paletteName: "warm premium neutral", background: "#F7F2EA", foreground: "#221F1A", accent: "#8A623A", muted: "#E7DDD0" },
  Premium: { paletteName: "premium warm contrast", background: "#F8F5EF", foreground: "#1F2428", accent: "#7A4E2D", muted: "#E8E1D5" },
  Editorial: { paletteName: "editorial neutral", background: "#FAFAF7", foreground: "#1C1C1A", accent: "#6E4B2F", muted: "#ECE7DF" },
  Hospitality: { paletteName: "hospitality warm", background: "#FFF7EF", foreground: "#2B211B", accent: "#B85C38", muted: "#F0DED0" },
  Industrial: { paletteName: "industrial contrast", background: "#F4F5F5", foreground: "#171A1D", accent: "#C84B31", muted: "#DDE1E3" },
  Technology: { paletteName: "technology neutral", background: "#F7F9FB", foreground: "#111827", accent: "#2563EB", muted: "#E5EAF0" },
  Warm: { paletteName: "warm accessible", background: "#FFF9F2", foreground: "#25211C", accent: "#9B5A2E", muted: "#EFE2D2" },
  Organic: { paletteName: "organic earth", background: "#FAF8F1", foreground: "#22291F", accent: "#5F7A4F", muted: "#E4E8DA" },
  Corporate: { paletteName: "corporate stable", background: "#F8FAFC", foreground: "#1F2937", accent: "#315C8C", muted: "#E5E7EB" },
  Modern: { paletteName: "modern neutral", background: "#FFFFFF", foreground: "#171717", accent: "#325CFF", muted: "#ECEFF3" },
  Minimal: { paletteName: "minimal monochrome", background: "#FFFFFF", foreground: "#181818", accent: "#3B3B3B", muted: "#EEEEEE" },
};

export function buildColorProfile(input: DesignInput, language: DesignLanguageProfile): ColorProfile {
  const existing = input.existingColors;
  const base = colorByLanguage[language.name] ?? colorByLanguage.Modern;
  return Object.freeze({
    ...base,
    accent: existing?.[0] ?? base.accent,
    behavior: [language.colorBehavior, ...(existing?.length ? ["adapt first provided color as accent intent"] : ["use deterministic palette intent"])],
  });
}
