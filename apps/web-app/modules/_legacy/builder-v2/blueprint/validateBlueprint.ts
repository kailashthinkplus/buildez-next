import type { BlueprintNode } from "@/modules/builder/renderer/PageRenderer";

/**
 * HARD structural rules
 * ❌ No auto-fixing here
 */
const ALLOWED_CHILDREN: Record<
  BlueprintNode["type"],
  BlueprintNode["type"][]
> = {
  page: ["section"],
  section: ["container"],
  container: ["column"],
  column: [
    "heading",
    "text",
    "image",
    "button",
    "container",
    "spacer",
  ],
  heading: [],
  text: [],
  image: [],
  button: [],
  spacer: [],
};

export function validateBlueprint(
  node: BlueprintNode,
  path = "page"
): void {
  if (!node || typeof node !== "object") {
    throw new Error(`Invalid node at ${path}`);
  }

  if (!node.type || !(node.type in ALLOWED_CHILDREN)) {
    throw new Error(`Unknown node type "${node.type}" at ${path}`);
  }

  if (!Array.isArray(node.children)) {
    throw new Error(`children must be an array at ${path}`);
  }

  const allowed = ALLOWED_CHILDREN[node.type];

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];

    if (!allowed.includes(child.type)) {
      throw new Error(
        `Invalid child "${child.type}" under "${node.type}" at ${path}`
      );
    }

    validateBlueprint(child, `${path}.${child.type}[${i}]`);
  }
}
