export interface ExtractedLogoColors {
  primary: string;
  background?: string;
}

export function extractLogoColors(imageBuffer: Buffer): ExtractedLogoColors {
  return {
    primary: "#2563eb",
    background: "#ffffff",
  };
}