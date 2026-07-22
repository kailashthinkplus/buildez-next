import { isResponsiveValue } from "./responsiveValue";
import type { BuilderResponsiveDevice, ResponsiveResolution, ResponsiveValueWithBase } from "./responsiveTypes";

const FALLBACK_CHAIN: Readonly<Record<BuilderResponsiveDevice, readonly (BuilderResponsiveDevice | "base")[]>> = Object.freeze({
  desktop: ["desktop", "base"],
  tablet: ["tablet", "desktop", "base"],
  mobile: ["mobile", "tablet", "desktop", "base"],
});

export function resolveResponsiveValue<T>(
  value: ResponsiveValueWithBase<T> | undefined,
  device: BuilderResponsiveDevice,
  fallback?: T
): ResponsiveResolution<T> {
  if (!isResponsiveValue(value)) {
    return Object.freeze({
      device,
      value: (value ?? fallback) as T | undefined,
      inheritedFrom: value === undefined ? null : "base",
      hasOverride: false,
    });
  }

  const record = value as Partial<Record<BuilderResponsiveDevice | "base", T>>;

  for (const key of FALLBACK_CHAIN[device]) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      return Object.freeze({
        device,
        value: record[key],
        inheritedFrom: key === device ? null : key,
        hasOverride: key === device,
      });
    }
  }

  return Object.freeze({
    device,
    value: fallback,
    inheritedFrom: null,
    hasOverride: false,
  });
}

export function getResponsiveValue<T>(
  value: ResponsiveValueWithBase<T> | undefined,
  device: BuilderResponsiveDevice,
  fallback?: T
): T | undefined {
  return resolveResponsiveValue(value, device, fallback).value;
}
