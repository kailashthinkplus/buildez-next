// -------------------------------------------------------------
// hydrateBlueprint.ts — V3 FINAL (WITH LEGACY MIGRATION)
// -------------------------------------------------------------
// Responsibilities:
// - Normalize ALL nodes to V3 schema
// - Migrate legacy node types
// - Inject preset defaults
// - Guarantee renderer-safe output
// -------------------------------------------------------------

import { BlueprintNode, NodeType } from "./types";
import { createNode } from "./registry";

/* -------------------------------------------------------------
   LEGACY → V3 TYPE MIGRATION MAP
------------------------------------------------------------- */
function migrateLegacyType(type: string): NodeType {
  switch (type) {
    case "section":
      return NodeType.SectionFeatures; // safe default section
    case "text":
      return NodeType.Paragraph;
    case "img":
      return NodeType.Image;
    default:
      return type as NodeType;
  }
}

/* -------------------------------------------------------------
   HYDRATE + MIGRATE (RECURSIVE)
------------------------------------------------------------- */
export function hydrateBlueprint(raw: BlueprintNode): BlueprintNode {
  if (!raw || !raw.type) {
    throw new Error("hydrateBlueprint: invalid node");
  }

  /* ---------------------------------------------------------
     MIGRATE TYPE (CRITICAL)
  --------------------------------------------------------- */
  const migratedType = migrateLegacyType(raw.type);

  /* ---------------------------------------------------------
     CREATE PRESET BASE
  --------------------------------------------------------- */
  const preset = createNode(migratedType);

  /* ---------------------------------------------------------
     NORMALIZE CHILDREN
  --------------------------------------------------------- */
  const rawChildren =
    Array.isArray(raw.children)
      ? raw.children
      : Array.isArray((raw as any).sections)
      ? (raw as any).sections
      : [];

  /* ---------------------------------------------------------
     FINAL NODE
  --------------------------------------------------------- */
  const hydrated: BlueprintNode = {
    ...preset,
    ...raw,
    type: migratedType,
    props: {
      ...preset.props,
      ...(raw.props || {}),
    },
    children: rawChildren.map(hydrateBlueprint),
  };

  if (process.env.NODE_ENV === "development") {
    if (raw.type !== migratedType) {
      console.info(
        "🟡 Blueprint migrated:",
        raw.type,
        "→",
        migratedType,
        "ID:",
        raw.id
      );
    }
  }

  return hydrated;
}
