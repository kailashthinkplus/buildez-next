import type { BlueprintNode } from "@/modules/builder/renderer/PageRenderer";

/* ============================================================
   TYPE MAP — AI → BUILDER
============================================================ */

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

/* ============================================================
   HELPERS
============================================================ */

/**
 * Wrap any block into:
 * container → column → block
 */
function wrapIntoContainer(
  block: BlueprintNode
): BlueprintNode {
  return {
    id: crypto.randomUUID(),
    type: "container",
    props: {
      layout: "block",
      gap: 0,
    },
    children: [
      {
        id: crypto.randomUUID(),
        type: "column",
        props: { flex: 1 },
        children: [block],
      },
    ],
  };
}

/**
 * Ensure container → column invariant
 */
function ensureColumns(
  node: BlueprintNode
): BlueprintNode {
  if (node.type !== "container") return node;

  const children = node.children ?? [];

  const hasColumn = children.some(
    (c) => c.type === "column"
  );

  if (hasColumn) return node;

  return {
    ...node,
    children: [
      {
        id: crypto.randomUUID(),
        type: "column",
        props: { flex: 1 },
        children,
      },
    ],
  };
}

/**
 * Ensure column → blocks invariant
 * (no nested columns)
 */
function ensureNoNestedColumns(
  node: BlueprintNode
): BlueprintNode {
  if (node.type !== "column") return node;

  const flattened: BlueprintNode[] = [];

  for (const child of node.children ?? []) {
    if (child.type === "column") {
      // 🔥 Illegal nesting — hoist grandchildren
      flattened.push(...(child.children ?? []));
    } else {
      flattened.push(child);
    }
  }

  return {
    ...node,
    children: flattened,
  };
}

/**
 * Ensure section → container invariant
 * (spacers / blocks are wrapped)
 */
function normalizeSection(
  node: BlueprintNode
): BlueprintNode {
  if (node.type !== "section") return node;

  const children: BlueprintNode[] = [];

  for (const child of node.children ?? []) {
    if (child.type === "container") {
      children.push(child);
    } else {
      // 🔥 spacer / text / anything else → wrap
      children.push(wrapIntoContainer(child));
    }
  }

  return {
    ...node,
    children,
  };
}

/**
 * Ensure container does NOT directly contain spacers or blocks
 */
function normalizeContainer(
  node: BlueprintNode
): BlueprintNode {
  if (node.type !== "container") return node;

  const children: BlueprintNode[] = [];

  for (const child of node.children ?? []) {
    if (child.type === "column") {
      children.push(child);
    } else {
      // 🔥 spacer / block → column
      children.push({
        id: crypto.randomUUID(),
        type: "column",
        props: { flex: 1 },
        children: [child],
      });
    }
  }

  return {
    ...node,
    children,
  };
}

/* ============================================================
   NORMALIZER (AUTHORITATIVE, ORDERED)
============================================================ */

export function normalizeAINode(node: any): BlueprintNode {
  const mappedType =
    TYPE_MAP[node.type] ??
    ([
      "page",
      "section",
      "container",
      "column",
      "heading",
      "text",
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
    },
    children: Array.isArray(node.children)
      ? node.children.map(normalizeAINode)
      : [],
  };

  /* ----------------------------------------------------------
     🔒 STRUCTURAL PASSES (ORDER MATTERS)
  ---------------------------------------------------------- */

  // 1️⃣ section → container
  normalized = normalizeSection(normalized);

  // 2️⃣ container → column
  normalized = normalizeContainer(normalized);

  // 3️⃣ ensure container always has column
  normalized = ensureColumns(normalized);

  // 4️⃣ column → blocks only
  normalized = ensureNoNestedColumns(normalized);

  return normalized;
}
