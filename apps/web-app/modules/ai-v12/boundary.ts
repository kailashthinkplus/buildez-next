export const AI_V12_MODULE_ID = "ai-v12" as const;
export const AI_V12_BOUNDARY_VERSION = 1 as const;

export type AiV12Boundary = Readonly<{
  moduleId: typeof AI_V12_MODULE_ID;
  boundaryVersion: typeof AI_V12_BOUNDARY_VERSION;
  runtimeEnabled: false;
}>;

export const aiV12Boundary: AiV12Boundary = Object.freeze({
  moduleId: AI_V12_MODULE_ID,
  boundaryVersion: AI_V12_BOUNDARY_VERSION,
  runtimeEnabled: false,
});
