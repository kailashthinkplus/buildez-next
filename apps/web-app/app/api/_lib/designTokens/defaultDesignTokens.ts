import { DesignTokens } from "@/modules/builder/runtime/designTokens/designTokens.types";

export function getDefaultDesignTokens(): DesignTokens {
  return {
    colors: {
      primary: "#2563eb",
      primaryHover: "#1d4ed8",
      onPrimary: "#ffffff",
      background: "#ffffff",
      surface: "#ffffff",
      onBackground: "#000000",
      textPrimary: "#000000",
      textSecondary: "#64748b",
    },
    typography: {},
    spacing: {},
    borderRadius: {},
  } as DesignTokens;
}