export const BUILDER_V3_MODULE_ID = "builder-v3" as const;
export const BUILDER_V3_BOUNDARY_VERSION = 1 as const;

export type BuilderV3Boundary = Readonly<{
  moduleId: typeof BUILDER_V3_MODULE_ID;
  boundaryVersion: typeof BUILDER_V3_BOUNDARY_VERSION;
  runtimeEnabled: false;
}>;

export const builderV3Boundary: BuilderV3Boundary = Object.freeze({
  moduleId: BUILDER_V3_MODULE_ID,
  boundaryVersion: BUILDER_V3_BOUNDARY_VERSION,
  runtimeEnabled: false,
});
