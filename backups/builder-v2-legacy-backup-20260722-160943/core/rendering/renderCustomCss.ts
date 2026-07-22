import type { BuilderBlueprint } from "../../types/blueprint";

export function collectRenderCustomCss(blueprint: BuilderBlueprint): string {
  return Object.values(blueprint.nodes)
    .map((node) => {
      const advanced = node.props?.advanced;
      if (!advanced || typeof advanced !== "object" || Array.isArray(advanced)) return "";
      const css = (advanced as Record<string, unknown>).customCss;
      if (typeof css !== "string" || !css.includes("{")) return "";
      const selector = `[data-node-id="${escapeCssAttribute(node.id)}"]`;
      return css
        .replace(/\bselector\b/g, selector)
        .replace(/(^|})\s*&/g, `$1 ${selector}`);
    })
    .filter(Boolean)
    .join("\n");
}

function escapeCssAttribute(value: string) {
  return value.replace(/["\\]/g, "\\$&");
}
