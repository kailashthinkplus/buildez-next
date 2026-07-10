import type { BuilderResponsiveDevice } from "./responsiveTypes";

export const RESPONSIVE_DEVICES: readonly BuilderResponsiveDevice[] = Object.freeze([
  "desktop",
  "tablet",
  "mobile",
]);

export const RESPONSIVE_BREAKPOINTS: Readonly<Record<BuilderResponsiveDevice, number>> = Object.freeze({
  desktop: 1200,
  tablet: 768,
  mobile: 390,
});

export function isResponsiveDevice(value: unknown): value is BuilderResponsiveDevice {
  return value === "desktop" || value === "tablet" || value === "mobile";
}
