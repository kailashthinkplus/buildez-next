// /Users/kailash/buildez/apps/web-app/modules/builder/runtime/designTokens/mapLogoColorsToTokens.ts

import { DesignTokens } from "@/modules/builder/runtime/designTokens/designTokens.types";
import { generateDefaultDesignTokens } from "./generateDefaultDesignTokens";
import { ExtractedLogoColors } from "./extractLogoColors";

/* ============================================================
   LOGO → DESIGN TOKENS MAPPER (ENHANCED)
   
   Extracts colors from logo and generates a complete design
   system with proper color relationships and contrast ratios.
============================================================ */

/**
 * Map extracted logo colors to full design token system
 * @param extracted - Colors extracted from logo analysis
 * @returns Complete design tokens with logo-based color scheme
 */
export function mapLogoColorsToDesignTokens(
  extracted: ExtractedLogoColors
): DesignTokens {
  // Start with complete default tokens
  const base = generateDefaultDesignTokens();

  // Extract logo colors with fallbacks
  const primary = extracted.primary;
  const accent = extracted.accent ?? extracted.secondary ?? extracted.primary;
  const backgroundFromLogo = extracted.background;

  // Generate color variants
  const primaryHover = darken(primary, 10);
  const primaryLight = lighten(primary, 40);
  const accentHover = darken(accent, 10);

  return {
    // Spread all base tokens (typography, spacing, shadows, radius, etc.)
    ...base,

    // Override colors with logo-based palette
    colors: {
      // Base surfaces
      background: backgroundFromLogo ?? base.colors.background,
      surface: backgroundFromLogo ? lighten(backgroundFromLogo, 3) : base.colors.surface,
      muted: backgroundFromLogo ? darken(backgroundFromLogo, 5) : base.colors.muted,

      // Text colors (ensure readability)
      textPrimary: base.colors.textPrimary,
      textSecondary: base.colors.textSecondary,
      textTertiary: base.colors.textTertiary,
      onBackground: base.colors.textPrimary,

      // Borders
      border: base.colors.border,
      borderHover: base.colors.borderHover,

      // Brand colors from logo
      primary,
      primaryHover,
      primaryLight,
      onPrimary: getContrastColor(primary),

      // Accent color from logo
      accent,
      accentHover,
      onAccent: getContrastColor(accent),

      // Status colors (keep defaults)
      success: base.colors.success,
      warning: base.colors.warning,
      error: base.colors.error,
      info: base.colors.info,
    },
  };
}

/* ============================================================
   COLOR MANIPULATION HELPERS
============================================================ */

/**
 * Darken a hex color by percentage
 * @param hex - Hex color code (#RRGGBB)
 * @param percent - Percentage to darken (0-100)
 * @returns Darkened hex color
 */
function darken(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  
  let R = (num >> 16) - amt;
  let G = ((num >> 8) & 0x00ff) - amt;
  let B = (num & 0x0000ff) - amt;
  
  // Clamp values between 0-255
  R = Math.max(0, Math.min(255, R));
  G = Math.max(0, Math.min(255, G));
  B = Math.max(0, Math.min(255, B));
  
  return "#" + ((R << 16) | (G << 8) | B).toString(16).padStart(6, "0");
}

/**
 * Lighten a hex color by percentage
 * @param hex - Hex color code (#RRGGBB)
 * @param percent - Percentage to lighten (0-100)
 * @returns Lightened hex color
 */
function lighten(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  
  let R = (num >> 16) + amt;
  let G = ((num >> 8) & 0x00ff) + amt;
  let B = (num & 0x0000ff) + amt;
  
  // Clamp values between 0-255
  R = Math.max(0, Math.min(255, R));
  G = Math.max(0, Math.min(255, G));
  B = Math.max(0, Math.min(255, B));
  
  return "#" + ((R << 16) | (G << 8) | B).toString(16).padStart(6, "0");
}

/**
 * Get contrasting text color (white or black) for a background
 * Uses WCAG luminance calculation for accessibility
 * @param hex - Background hex color
 * @returns "#ffffff" for dark backgrounds, "#000000" for light backgrounds
 */
function getContrastColor(hex: string): string {
  // Convert hex to RGB
  const num = parseInt(hex.replace("#", ""), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  
  // Calculate relative luminance (WCAG formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

/**
 * Calculate relative luminance for WCAG contrast ratio
 * @param hex - Hex color code
 * @returns Relative luminance (0-1)
 */
function getRelativeLuminance(hex: string): number {
  const num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  
  // Convert to 0-1 range
  r = r / 255;
  g = g / 255;
  b = b / 255;
  
  // Apply gamma correction
  r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate WCAG contrast ratio between two colors
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG AA standard
 * @param foreground - Foreground hex color
 * @param background - Background hex color
 * @param isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns true if contrast ratio meets WCAG AA
 */
export function meetsWCAGAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if color combination meets WCAG AAA standard
 * @param foreground - Foreground hex color
 * @param background - Background hex color
 * @param isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns true if contrast ratio meets WCAG AAA
 */
export function meetsWCAGAAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}
