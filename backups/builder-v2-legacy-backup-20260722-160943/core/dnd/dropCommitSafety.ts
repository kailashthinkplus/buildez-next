export type DropCommitCandidate = {
  activeId: string | null;
  payloadId: string | null;
  cancelled: boolean;
  committed: boolean;
  overChrome: boolean;
  overDraggedSubtree: boolean;
  pendingOverId: string | null;
  currentOverId: string | null;
  pendingIntent: string | null;
  currentIntent: string | null;
  pendingParentId: string | null;
  currentParentId: string | null;
};

export function canCommitDrop(candidate: DropCommitCandidate): boolean {
  return Boolean(
    candidate.activeId &&
    !candidate.cancelled &&
    !candidate.committed &&
    !candidate.overChrome &&
    !candidate.overDraggedSubtree &&
    (!candidate.payloadId || candidate.payloadId === candidate.activeId) &&
    candidate.pendingOverId &&
    candidate.pendingOverId === candidate.currentOverId &&
    candidate.pendingIntent &&
    candidate.pendingIntent === candidate.currentIntent &&
    candidate.pendingParentId &&
    candidate.pendingParentId === candidate.currentParentId
  );
}
