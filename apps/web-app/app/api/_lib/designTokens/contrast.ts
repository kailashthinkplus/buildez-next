/* ============================================================
   COLOR CONTRAST UTILITIES (WCAG AA)
   SERVER ONLY — PURE FUNCTIONS
============================================================ */

function hexToRgb(hex: string) {
  const cleaned = hex.replace("#", "");
  const bigint = parseInt(cleaned, 16);

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function luminance({ r, g, b }: any) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928
      ? v / 12.92
      : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

export function contrastRatio(
  fg: string,
  bg: string
): number {
  const L1 = luminance(hexToRgb(fg)) + 0.05;
  const L2 = luminance(hexToRgb(bg)) + 0.05;

  return L1 > L2 ? L1 / L2 : L2 / L1;
}

/**
 * Returns either #000 or #fff — whichever is accessible
 */
export function readableTextColor(
  background: string,
  minRatio = 4.5
): "#000000" | "#ffffff" {
  const black = contrastRatio("#000000", background);
  const white = contrastRatio("#ffffff", background);

  if (white >= minRatio) return "#ffffff";
  return "#000000";
}
