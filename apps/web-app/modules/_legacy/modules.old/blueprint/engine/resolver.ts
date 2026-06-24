// RFC-004 — Resolver (compute final merged node)

import { SectionBlueprint } from "../types";

export function resolveNode(
  node: SectionBlueprint,
  device: "desktop" | "tablet" | "mobile"
): SectionBlueprint {
  // TODO (merge responsive + tokens)
  return node;
}
