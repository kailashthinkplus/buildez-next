import type { BuilderBlueprint } from "../../types/blueprint";

export type CssSecurityViolation = Readonly<{
  nodeId: string;
  construct: string;
}>;

const FORBIDDEN_CUSTOM_CSS: readonly [RegExp, string][] = Object.freeze([
  [/@import\b/i, "@import"],
  [/expression\s*\(/i, "expression("],
  [/javascript\s*:/i, "javascript:"],
  [/(?:^|[;{])\s*behavior\s*:/i, "behavior:"],
  [/https?:\/\//i, "external-url"],
  [/url\s*\(\s*["']?\s*\/\//i, "external-url"],
]);

export function certifyBlueprintCustomCss(
  blueprint: BuilderBlueprint,
): readonly CssSecurityViolation[] {
  const violations: CssSecurityViolation[] = [];
  for (const node of Object.values(blueprint.nodes)) {
    const advanced = node.props?.advanced;
    if (!advanced || typeof advanced !== "object" || Array.isArray(advanced))
      continue;
    const customCss = (advanced as Record<string, unknown>).customCss;
    if (typeof customCss !== "string") continue;
    for (const [pattern, construct] of FORBIDDEN_CUSTOM_CSS)
      if (pattern.test(customCss)) violations.push({ nodeId: node.id, construct });
  }
  return Object.freeze(violations);
}
