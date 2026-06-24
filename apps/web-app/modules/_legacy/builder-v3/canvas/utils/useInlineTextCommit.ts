"use client";

import { useCallback } from "react";
import { useBlueprintStore } from "@/modules/builder/state/useBlueprintStore";

/**
 * Inline text commit hook
 * ---------------------------------------
 * - Used by contenteditable renderers
 * - Writes directly to ShadowTree
 * - Fully compatible with:
 *   - Undo / Redo
 *   - Inspector
 *   - AI patches
 */
export function useInlineTextCommit(nodeId: string) {
  const updateNodeProps = useBlueprintStore((s) => s.updateNodeProps);

  return useCallback(
    (text: string) => {
      if (!nodeId) return;

      updateNodeProps(nodeId, {
        content: {
          text,
        },
      });
    },
    [nodeId, updateNodeProps]
  );
}
