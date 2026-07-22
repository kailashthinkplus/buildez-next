import type { BuilderResponsiveDevice, ResponsiveValueWithBase } from "./responsiveTypes";

export function isResponsiveValue(value: unknown): value is Partial<Record<BuilderResponsiveDevice | "base", unknown>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return ["base", "desktop", "tablet", "mobile"].some((key) =>
    Object.prototype.hasOwnProperty.call(value, key)
  );
}

export function hasResponsiveOverride(value: unknown, device: BuilderResponsiveDevice): boolean {
  return isResponsiveValue(value) && Object.prototype.hasOwnProperty.call(value, device);
}

export function getBaseResponsiveValue<T>(value: ResponsiveValueWithBase<T> | undefined): T | undefined {
  if (isResponsiveValue(value)) {
    return (value.base ?? value.desktop) as T | undefined;
  }

  return value as T | undefined;
}

export function toResponsiveRecord<T>(
  value: ResponsiveValueWithBase<T> | undefined
): Partial<Record<BuilderResponsiveDevice | "base", T>> {
  if (isResponsiveValue(value)) {
    return { ...(value as Partial<Record<BuilderResponsiveDevice | "base", T>>) };
  }

  if (value === undefined) {
    return {};
  }

  return { base: value as T, desktop: value as T };
}
