import { toResponsiveRecord } from "./responsiveValue";
import type { BuilderResponsiveDevice, ResponsiveValueWithBase } from "./responsiveTypes";

export function setResponsiveOverride<T>(
  current: ResponsiveValueWithBase<T> | undefined,
  device: BuilderResponsiveDevice,
  value: T
): ResponsiveValueWithBase<T> {
  const next = toResponsiveRecord(current);

  if (device === "desktop") {
    next.desktop = value;
    if (!Object.prototype.hasOwnProperty.call(next, "base")) {
      next.base = value;
    }
  } else {
    next[device] = value;
  }

  return next;
}

export function resetResponsiveOverride<T>(
  current: ResponsiveValueWithBase<T> | undefined,
  device: BuilderResponsiveDevice
): ResponsiveValueWithBase<T> | undefined {
  if (!current || typeof current !== "object" || Array.isArray(current)) {
    return current;
  }

  const next = { ...(current as Partial<Record<BuilderResponsiveDevice | "base", T>>) };
  delete next[device];

  const keys = Object.keys(next);
  if (keys.length === 0) return undefined;
  if (keys.length === 1 && Object.prototype.hasOwnProperty.call(next, "base")) return next.base;
  return next;
}
