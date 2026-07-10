import type { NodeType } from "../../types/blueprint";
import type { RenderTarget } from "./renderTargets";

export type RendererParityRuleCategory =
  | "widget-support"
  | "responsive"
  | "style-binding"
  | "asset-readiness"
  | "motion-metadata"
  | "mapper-compatibility"
  | "target-coverage"
  | "side-effect-safety";

export type RendererParityRule = Readonly<{
  id: string;
  category: RendererParityRuleCategory;
  target: RenderTarget | "all";
  severity: "info" | "minor" | "major" | "blocker";
  description: string;
}>;

export const RENDERER_PARITY_SUPPORTED_WIDGET_TYPES = Object.freeze([
  "page",
  "section",
  "container",
  "column",
  "heading",
  "text",
  "button",
  "image",
  "video",
  "icon",
  "divider",
  "spacer",
] satisfies NodeType[]);

/**
 * Returns the metadata-level rules used by Phase 33 parity checks.
 *
 * @example
 * const rules = buildRendererParityRules();
 */
export function buildRendererParityRules(): RendererParityRule[] {
  return [
    Object.freeze({ id: "parity.rule.widget-support", category: "widget-support" as const, target: "all" as const, severity: "blocker" as const, description: "Every mapped widget must be supported by native Builder render surfaces." }),
    Object.freeze({ id: "parity.rule.responsive", category: "responsive" as const, target: "all" as const, severity: "major" as const, description: "Responsive metadata must exist before parity can be trusted across breakpoints." }),
    Object.freeze({ id: "parity.rule.style-binding", category: "style-binding" as const, target: "all" as const, severity: "major" as const, description: "Style bindings must be explicit so canvas, preview, published, and export can interpret the same intent." }),
    Object.freeze({ id: "parity.rule.asset-readiness", category: "asset-readiness" as const, target: "published" as const, severity: "major" as const, description: "Required assets must be declared and missing assets must remain explicit." }),
    Object.freeze({ id: "parity.rule.motion-metadata", category: "motion-metadata" as const, target: "all" as const, severity: "minor" as const, description: "Motion metadata should be present or explicitly absent so render targets do not invent behavior." }),
    Object.freeze({ id: "parity.rule.mapper-compatibility", category: "mapper-compatibility" as const, target: "all" as const, severity: "blocker" as const, description: "Renderer parity requires a valid native mapping plan or Builder Blueprint reference." }),
    Object.freeze({ id: "parity.rule.target-coverage", category: "target-coverage" as const, target: "all" as const, severity: "blocker" as const, description: "Target matrix must include canvas, preview, published, and export." }),
    Object.freeze({ id: "parity.rule.side-effect-safety", category: "side-effect-safety" as const, target: "all" as const, severity: "blocker" as const, description: "Parity checks must not render, capture screenshots, mutate store, or call external services." }),
  ];
}
