import { PageBlueprint } from "@/modules/blueprint/types";
import { HistoryEntry } from "./historyTypes";

export function applyHistoryEntry(
  entry: HistoryEntry
): PageBlueprint {
  return entry.after;
}

export function revertHistoryEntry(
  entry: HistoryEntry
): PageBlueprint {
  return entry.before;
}
