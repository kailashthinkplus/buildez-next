/**
 * In-memory handoff for files attached in a dashboard AI prompt box before the
 * user is routed into the Builder 3 canvas. Client-side navigation (router.push)
 * keeps the JS runtime alive, so File objects can be carried across the route
 * change without serializing them (attachments can be up to 1 GB, far beyond
 * what sessionStorage/localStorage can hold).
 */
let pending: File[] | null = null;

export function stashPendingAttachments(files: readonly File[]) {
  pending = files.length ? [...files] : null;
}

export function takePendingAttachments(): File[] {
  const files = pending ?? [];
  pending = null;
  return files;
}
