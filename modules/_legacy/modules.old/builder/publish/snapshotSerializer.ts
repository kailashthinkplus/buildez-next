import { PublishSnapshot } from "./publishTypes";
import { SiteBlueprint, PageBlueprint } from "@/modules/blueprint/types";

export function createSnapshot(
  site: SiteBlueprint,
  pages: Record<string, PageBlueprint>
): PublishSnapshot {
  return {
    id: "",
    createdAt: Date.now(),
    site,
    pages,
  };
}

export function serializeSnapshot(snapshot: PublishSnapshot): string {
  return JSON.stringify(snapshot);
}
