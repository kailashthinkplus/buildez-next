import { getResponsiveValue, type BuilderResponsiveDevice } from "../responsive";

export function resolveRenderResponsiveValue(
  value: unknown,
  device: BuilderResponsiveDevice,
  fallback?: unknown
): unknown {
  return getResponsiveValue(value, device, fallback);
}
