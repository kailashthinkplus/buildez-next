import type { ColorProfile } from "./designIntent";

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized;
  const numeric = Number.parseInt(value, 16);
  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255,
  };
}

function luminance(hex: string) {
  const rgb = hexToRgb(hex);
  const values = [rgb.r, rgb.g, rgb.b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}

function contrastRatio(left: string, right: string) {
  const a = luminance(left);
  const b = luminance(right);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * Performs basic contrast checks without rendering CSS.
 *
 * @example
 * const notes = validateContrastBasics(colorProfile);
 */
export function validateContrastBasics(color: ColorProfile): string[] {
  const foregroundRatio = contrastRatio(color.background, color.foreground);
  const accentRatio = contrastRatio(color.background, color.accent);
  return [
    `foreground/background contrast ratio ${foregroundRatio.toFixed(2)}`,
    `accent/background contrast ratio ${accentRatio.toFixed(2)}`,
    ...(foregroundRatio < 4.5 ? ["foreground contrast should be strengthened before rendering"] : []),
    ...(accentRatio < 3 ? ["accent contrast should be checked for CTA usage"] : []),
  ];
}
