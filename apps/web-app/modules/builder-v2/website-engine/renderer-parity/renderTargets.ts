export type RenderTarget = "canvas" | "preview" | "published" | "export";

export type RenderTargetDescriptor = Readonly<{
  id: RenderTarget;
  label: string;
  expectedSurface: "builder-canvas" | "preview-route" | "published-runtime" | "static-export";
  requiresInteractivity: boolean;
  requiresResponsiveRules: boolean;
  requiresAssetResolution: boolean;
}>;

/**
 * Builds the canonical renderer target matrix without touching any renderer.
 *
 * @example
 * const targets = buildRenderTargetMatrix();
 */
export function buildRenderTargetMatrix(): RenderTargetDescriptor[] {
  return [
    Object.freeze({
      id: "canvas" as const,
      label: "Builder Canvas",
      expectedSurface: "builder-canvas" as const,
      requiresInteractivity: true,
      requiresResponsiveRules: true,
      requiresAssetResolution: false,
    }),
    Object.freeze({
      id: "preview" as const,
      label: "Preview",
      expectedSurface: "preview-route" as const,
      requiresInteractivity: false,
      requiresResponsiveRules: true,
      requiresAssetResolution: true,
    }),
    Object.freeze({
      id: "published" as const,
      label: "Published Page",
      expectedSurface: "published-runtime" as const,
      requiresInteractivity: false,
      requiresResponsiveRules: true,
      requiresAssetResolution: true,
    }),
    Object.freeze({
      id: "export" as const,
      label: "Export Runtime",
      expectedSurface: "static-export" as const,
      requiresInteractivity: false,
      requiresResponsiveRules: true,
      requiresAssetResolution: true,
    }),
  ];
}
