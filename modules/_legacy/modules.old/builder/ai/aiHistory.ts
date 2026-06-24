import { AIChange } from "./aiTypes";

export interface AIHistoryEntry {
  timestamp: number;
  change: AIChange;
}

export function recordAIChange(change: AIChange): AIHistoryEntry {
  return {
    timestamp: Date.now(),
    change,
  };
}
