import { CollabEnvelope, CollabSyncResult } from "./collabTypes";

export function syncChanges(
  envelopes: CollabEnvelope[]
): CollabSyncResult {
  return {
    applied: envelopes,
    rejected: [],
  };
}
