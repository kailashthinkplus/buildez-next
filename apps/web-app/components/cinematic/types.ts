export type CinematicManifest = {
  id: string;
  frameCount: number;
  width: number;
  height: number;
  /** Pattern containing "{frame}", resolved to a 4-digit 1-indexed frame number. */
  desktop: string;
  desktopFallback?: string;
  mobile?: string;
  mobileFallback?: string;
  /** A single representative frame, shown until the first real frame decodes and as the failure fallback. */
  poster?: string;
};

export function resolveFramePath(pattern: string, index: number): string {
  return pattern.replace("{frame}", String(index + 1).padStart(4, "0"));
}
