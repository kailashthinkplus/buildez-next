import { DesignTokens } from
  "@/modules/builder/runtime/designTokens/designTokens.types";
import { getDefaultDesignTokens } from "./defaultDesignTokens";
import { ExtractedLogoColors } from "./extractLogoColors";
import { readableTextColor } from "./contrast";

/* ============================================================
   LOGO → DESIGN TOKENS (WITH CONTRAST SAFETY)
============================================================ */

export function mapLogoColorsToDesignTokens(
  extracted: ExtractedLogoColors
): DesignTokens {
  const base = getDefaultDesignTokens();

  const primary = extracted.primary;
  const onPrimary = readableTextColor(primary);

  const background =
    extracted.background ?? base.colors.background;

  const onBackground = readableTextColor(background);

  return {
    ...base,

    colors: {
      ...base.colors,

      /* BRAND */
      primary,
      primaryHover: primary,
      onPrimary,

      /* SURFACE */
      background,
      surface: background,
      onBackground,

      /* TEXT */
      textPrimary: onBackground,
      textSecondary:
        onBackground === "#000000"
          ? "#334155"
          : "#e5e7eb",
    },
  };
}
