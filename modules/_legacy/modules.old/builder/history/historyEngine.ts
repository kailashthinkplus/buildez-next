import { HistoryEntry } from "./historyTypes";

export function createHistoryEntry(params: {
  description: string;
  before: any;
  after: any;
}): HistoryEntry {
  return {
    id: "",
    timestamp: Date.now(),
    description: params.description,
    before: params.before,
    after: params.after,
  };
}
