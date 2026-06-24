import type { BlueprintNode } from "@/modules/builder/renderer/PageRenderer";

const TYPE_MAP: Record<string, BlueprintNode["type"]> = {
  "layout-row": "container",
  "layout-grid": "container",
  stack: "container",
  card: "container",

  badge: "text",
  icon: "text",
  logo: "image",

  "skeleton-row": "spacer",
};

export function normalizeAINode(node: any): BlueprintNode {
  const mappedType =
    TYPE_MAP[node.type] ??
    ([
      "page",
      "section",
      "container",
      "column",
      "text",
      "heading",
      "button",
      "image",
      "spacer",
    ].includes(node.type)
      ? node.type
      : "container"); // ultimate fallback

  return {
    id: node.id ?? crypto.randomUUID(),
    type: mappedType as BlueprintNode["type"],
    props: node.props ?? {},
    children: Array.isArray(node.children)
      ? node.children.map(normalizeAINode)
      : [],
  };
}
