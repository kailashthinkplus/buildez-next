// -------------------------------------------------------------
// updateRects.ts — V3 FINAL
// -------------------------------------------------------------
// Maintains rectMap in useHighlightStore by observing DOM changes.
// Called by wrappers on mount/unmount.
// -------------------------------------------------------------

import { useHighlightStore } from "@/modules/builder/state/useHighlightStore";

export function updateRect(nodeId: string, el: HTMLElement | null) {
  if (!el) return;

  const rect = el.getBoundingClientRect();
  useHighlightStore.getState().setRect(nodeId, rect);
}

export function observeRect(nodeId: string, el: HTMLElement | null) {
  if (!el) return;

  const observer = new ResizeObserver(() => {
    updateRect(nodeId, el);
  });

  observer.observe(el);

  updateRect(nodeId, el);

  return () => observer.disconnect();
}
