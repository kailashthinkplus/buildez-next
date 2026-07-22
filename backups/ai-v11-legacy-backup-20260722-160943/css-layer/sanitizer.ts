import type { DesignGraphNode } from "../design-graph/schema";
import type { FidelityDiagnostic } from "../diagnostics/fidelity";
import type { ParsedResidualCss } from "./cssAst";
import { cssDiagnostic } from "./diagnostics";
import { CSS_POLICY } from "./policy";
import { validateLocalSelector } from "./scoper";

export type SanitizedCss = Readonly<{ css: string; diagnostics: readonly FidelityDiagnostic[]; safe: boolean }>;

export function sanitizeResidualCss(parsed: ParsedResidualCss, node: DesignGraphNode): SanitizedCss {
  const diagnostics: FidelityDiagnostic[] = [];
  let rules = 0, animations = 0;
  parsed.root.walk((child) => {
    if (child.type === "rule") {
      rules += 1;
      if (child.parent?.type === "atrule" && child.parent.name === "keyframes") return;
      if (!validateLocalSelector(child.selector)) { diagnostics.push(cssDiagnostic(node, "UNSAFE_CSS_SELECTOR", `Selector '${child.selector}' is not node-local.`, child.selector)); child.remove(); return; }
    }
    if (child.type === "atrule") {
      if (!CSS_POLICY.allowedAtRules.has(child.name)) { diagnostics.push(cssDiagnostic(node, "UNSAFE_CSS_AT_RULE", `At-rule '@${child.name}' is forbidden.`, child.name)); child.remove(); return; }
      if (child.name === "keyframes") animations += 1;
    }
    if (child.type === "decl") {
      const property = child.prop.toLowerCase();
      const value = child.value.toLowerCase();
      if (/^(?:behavior|-moz-binding)$/i.test(property)) { diagnostics.push(cssDiagnostic(node, "UNSAFE_CSS_PROPERTY", `Property '${property}' enables executable CSS behavior.`, property)); child.remove(); return; }
      if (/javascript\s*:|@import|expression\s*\(|-moz-binding/i.test(value) || /url\s*\(\s*["']?\s*(?:https?:)?\/\//i.test(value)) { diagnostics.push(cssDiagnostic(node, "UNSAFE_CSS_VALUE", `Value for '${property}' contains a forbidden resource or executable construct.`, value)); child.remove(); }
    }
  });
  if (rules > CSS_POLICY.maxRules) diagnostics.push(cssDiagnostic(node, "CSS_RULE_BUDGET", `Rule count ${rules} exceeds ${CSS_POLICY.maxRules}.`, String(rules)));
  if (animations > CSS_POLICY.maxAnimations) diagnostics.push(cssDiagnostic(node, "CSS_ANIMATION_BUDGET", `Animation count ${animations} exceeds ${CSS_POLICY.maxAnimations}.`, String(animations)));
  const css = parsed.root.toString();
  if (Buffer.byteLength(css, "utf8") > CSS_POLICY.maxBytes) diagnostics.push(cssDiagnostic(node, "CSS_BYTE_BUDGET", "Sanitized CSS exceeds the byte budget.", String(css.length)));
  return Object.freeze({ css, diagnostics: Object.freeze(diagnostics), safe: diagnostics.length === 0 });
}
