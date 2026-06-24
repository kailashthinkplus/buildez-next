import { CollabEnvelope, CollabSyncResult } from "./collabTypes";

export function applyRemoteChange(
  envelope: CollabEnvelope
): CollabSyncResult {
  return {
    applied: [envelope],
    rejected: [],
  };
}

export function mergeCollabEnvelope(
  envelope: CollabEnvelope
): CollabEnvelope {
  return envelope;
}
