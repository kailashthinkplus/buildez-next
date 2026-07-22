import type { BuilderDevice, ResponsiveStyleValue } from "../../types/blueprint";
import {
  getResponsiveValue,
  resetResponsiveOverride,
  resolveResponsiveValue,
  setResponsiveOverride,
  type BuilderResponsiveDevice,
} from "../../core/responsive";

export type TestResponsiveDevice = Extract<BuilderDevice, "desktop" | "tablet" | "mobile">;

export const TEST_RESPONSIVE_DEVICES: TestResponsiveDevice[] = [
  "desktop",
  "tablet",
  "mobile",
];

export function readResponsiveValueForSpec<T>(
  value: ResponsiveStyleValue<T> | undefined,
  device: TestResponsiveDevice,
  fallback: T
): T {
  return getResponsiveValue(value, device as BuilderResponsiveDevice, fallback) as T;
}

export function readResponsiveResolutionForSpec<T>(
  value: ResponsiveStyleValue<T> | undefined,
  device: TestResponsiveDevice,
  fallback: T
) {
  return resolveResponsiveValue(value, device as BuilderResponsiveDevice, fallback);
}

export function writeResponsiveValueForSpec<T>(
  current: ResponsiveStyleValue<T> | undefined,
  device: TestResponsiveDevice,
  value: T
): ResponsiveStyleValue<T> {
  return setResponsiveOverride(current, device as BuilderResponsiveDevice, value) as ResponsiveStyleValue<T>;
}

export function resetResponsiveValueForSpec<T>(
  current: ResponsiveStyleValue<T> | undefined,
  device: TestResponsiveDevice
): ResponsiveStyleValue<T> | undefined {
  return resetResponsiveOverride(current, device as BuilderResponsiveDevice) as ResponsiveStyleValue<T> | undefined;
}
