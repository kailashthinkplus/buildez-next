import { PageBlueprint } from "@/modules/blueprint/types";

export interface HistoryEntry {
  id: string;
  timestamp: number;
  description: string;
  before: PageBlueprint;
  after: PageBlueprint;
}

export interface HistorySnapshot {
  pageId: string;
  entries: HistoryEntry[];
  pointer: number;
}
