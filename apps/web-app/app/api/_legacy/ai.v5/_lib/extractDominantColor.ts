import sharp from "sharp";

/* ============================================================
   DOMINANT COLOR EXTRACTION (SERVER-ONLY)
   - No canvas
   - No browser deps
   - Deterministic
============================================================ */

export interface DominantColorResult {
  primary: string;     // hex
  onPrimary: string;   // contrast-safe text color
}

/* ------------------------------------------------------------
   RGB → HEX
------------------------------------------------------------ */
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
  );
}

/* ------------------------------------------------------------
   CONTRAST-SAFE TEXT COLOR
------------------------------------------------------------ */
function getContrastTextColor(r: number, g: number, b: number): string {
  // Per WCAG luminance formula
  const luminance =
    (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.6 ? "#020617" : "#ffffff";
}

/* ------------------------------------------------------------
   EXTRACT DOMINANT COLOR
------------------------------------------------------------ */
export async function extractDominantColor(
  input: Buffer
): Promise<DominantColorResult> {
  /*
    Strategy:
    - Resize image very small
    - Read raw pixels
    - Average them
    - This is stable and fast
  */

  const image = sharp(input)
    .resize(64, 64, { fit: "inside" })
    .removeAlpha()
    .raw();

  const { data, info } = await image.toBuffer({ resolveWithObject: true });

  let r = 0;
  let g = 0;
  let b = 0;

  const pixelCount = info.width * info.height;

  for (let i = 0; i < data.length; i += info.channels) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  r = Math.round(r / pixelCount);
  g = Math.round(g / pixelCount);
  b = Math.round(b / pixelCount);

  return {
    primary: rgbToHex(r, g, b),
    onPrimary: getContrastTextColor(r, g, b),
  };
}
