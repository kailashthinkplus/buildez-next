import type { DesignGraphNode } from "../design-graph/schema";
import type { FidelityDiagnostic } from "../diagnostics/fidelity";
import { parseResidualCss } from "./cssAst";
import { classifyNodeDesign } from "./classifier";
import { sanitizeResidualCss } from "./sanitizer";

export type CssLowering = Readonly<{ customCss?: string; reasons: readonly string[]; diagnostics: readonly FidelityDiagnostic[]; safe: boolean }>;

const SELECTOR_SUFFIX = Object.freeze({ self: "", "::before": "::before", "::after": "::after", ":hover": ":hover", ":focus-visible": ":focus-visible" });

export function lowerResidualCss(node: DesignGraphNode): CssLowering {
  const classified = classifyNodeDesign(node);
  if (!classified.residual.length && !node.embeddedCss) return Object.freeze({ reasons: Object.freeze([]), diagnostics: Object.freeze([]), safe: true });
  const generated = classified.residual.map((effect) => {
    const declarations = Object.entries(effect.declarations).map(([property, value]) => `  ${property}: ${value};`).join("\n");
    return `selector${SELECTOR_SUFFIX[effect.selector]} {\n${declarations}\n}`;
  }).join("\n");
  const source = [generated, node.embeddedCss].filter(Boolean).join("\n");
  const sanitized = sanitizeResidualCss(parseResidualCss(source), node);
  return Object.freeze({ customCss: sanitized.css || undefined, reasons: Object.freeze([...classified.residual.map((effect) => effect.reason), ...(node.embeddedCss ? ["Embedded static CSS class"] : [])]), diagnostics: sanitized.diagnostics, safe: sanitized.safe });
}
