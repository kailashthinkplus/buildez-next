// RFC-004 — Diff Engine

import { PageBlueprint } from "../types";

export interface BlueprintDiff {
  changes: any[];
}

export function diffBlueprint(
  prev: PageBlueprint,
  next: PageBlueprint
): BlueprintDiff {
  // TODO (RFC-004 deterministic diff)
  return { changes: [] };
}
