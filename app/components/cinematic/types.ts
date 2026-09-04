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
};

export function resolveFramePath(pattern: string, index: number): string {
  return pattern.replace("{frame}", String(index + 1).padStart(4, "0"));
}
