export const BUILDER_V3_CANVAS_MODES = ["preview", "edit"] as const;

export type BuilderV3CanvasMode = (typeof BUILDER_V3_CANVAS_MODES)[number];

export type BuilderV3CanvasModeContract = Readonly<{
  mode: BuilderV3CanvasMode;
  renderSource: "canonical-vite-project";
  interactionOverlay: "none" | "source-mapped-editing";
}>;

export function createCanvasModeContract(mode: BuilderV3CanvasMode): BuilderV3CanvasModeContract {
  return Object.freeze({
    mode,
    renderSource: "canonical-vite-project",
    interactionOverlay: mode === "edit" ? "source-mapped-editing" : "none",
  });
}

export function isBuilderV3CanvasMode(value: unknown): value is BuilderV3CanvasMode {
  return value === "preview" || value === "edit";
}
