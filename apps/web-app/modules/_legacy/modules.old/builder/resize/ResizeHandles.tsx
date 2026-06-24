"use client";

import ResizeHandle from "./ResizeHandle";

/**
 * 8-direction resize handles:
 * - n, s, e, w
 * - ne, nw, se, sw
 */
export default function ResizeHandles({ nodeId }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-[50]">
      {/* Cardinal directions */}
      <ResizeHandle nodeId={nodeId} direction="n" />
      <ResizeHandle nodeId={nodeId} direction="s" />
      <ResizeHandle nodeId={nodeId} direction="e" />
      <ResizeHandle nodeId={nodeId} direction="w" />

      {/* Corners */}
      <ResizeHandle nodeId={nodeId} direction="ne" />
      <ResizeHandle nodeId={nodeId} direction="nw" />
      <ResizeHandle nodeId={nodeId} direction="se" />
      <ResizeHandle nodeId={nodeId} direction="sw" />
    </div>
  );
}
