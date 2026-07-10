import type { BuilderDevice } from "../../types/blueprint";

export type BuilderResponsiveDevice = Extract<BuilderDevice, "desktop" | "tablet" | "mobile">;

export type ResponsiveOverride<T = unknown> = Readonly<{
  value: T;
  overridden: true;
}>;

export type ResponsiveValueWithBase<T = unknown> = T | Partial<Record<BuilderResponsiveDevice | "base", T>>;

export type ResponsiveResolution<T = unknown> = Readonly<{
  device: BuilderResponsiveDevice;
  value: T | undefined;
  inheritedFrom: BuilderResponsiveDevice | "base" | null;
  hasOverride: boolean;
}>;

export type ResponsiveUpdateOptions = Readonly<{
  device: BuilderResponsiveDevice;
  reset?: boolean;
}>;
