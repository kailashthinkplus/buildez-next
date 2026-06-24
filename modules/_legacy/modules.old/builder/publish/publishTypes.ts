import { PageBlueprint, SiteBlueprint } from "@/modules/blueprint/types";

export interface PublishSnapshot {
  id: string;
  createdAt: number;
  site: SiteBlueprint;
  pages: Record<string, PageBlueprint>;
}

export interface PublishResult {
  snapshotId: string;
  url: string;
}
