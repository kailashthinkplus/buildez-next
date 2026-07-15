// /apps/web-app/app/api/ai/_lib/branding/ensureContrast.ts

import { DesignTokens } from
  "@/modules/builder/runtime/designTokens/designTokens.types";

/* ============================================================
   HELPERS
============================================================ */

function luminance(hex: string) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;

  const a = [r, g, b].map(v =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );

  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrastRatio(a: string, b: string) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/* ============================================================
   CORE
============================================================ */

export function ensureAccessibleContrast(
  tokens: DesignTokens
): DesignTokens {
  const next = structuredClone(tokens);

  // Ensure body text readable on background
  if (contrastRatio(
    next.colors.textPrimary,
    next.colors.background
  ) < 4.5) {
    next.colors.textPrimary =
      next.colors.background === "#020617"
        ? "#ffffff"
        : "#020617";
  }

  // Ensure button text readable
  if (contrastRatio(
    next.colors.onPrimary,
    next.colors.primary
  ) < 4.5) {
    next.colors.onPrimary =
      luminance(next.colors.primary) < 0.5
        ? "#ffffff"
        : "#020617";
  }

  return next;
}
