import type { BlueprintNode } from "@/modules/builder/renderer/PageRenderer";

/**
 * Maps AI layout concepts → Builder schema
 */
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

/**
 * Ensures container → column → blocks invariant
 */
function ensureColumns(node: BlueprintNode): BlueprintNode {
  if (node.type !== "container") return node;

  const hasColumn =
    Array.isArray(node.children) &&
    node.children.some((c) => c.type === "column");

  // ✅ Already valid
  if (hasColumn) return node;

  // 🔥 Wrap existing children into a default column
  const column: BlueprintNode = {
    id: crypto.randomUUID(),
    type: "column",
    props: { flex: 1 },
    children: node.children ?? [],
  };

  return {
    ...node,
    children: [column],
  };
}

/**
 * Normalizes any AI node into a valid BlueprintNode
 */
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
      : "container");

  let normalized: BlueprintNode = {
    id: node.id ?? crypto.randomUUID(),
    type: mappedType as BlueprintNode["type"],
props: {
  ...(node.props ?? {}),
},    children: Array.isArray(node.children)
      ? node.children.map(normalizeAINode)
      : [],
  };

  // 🔥 CRITICAL STEP
  normalized = ensureColumns(normalized);

  return normalized;
}
