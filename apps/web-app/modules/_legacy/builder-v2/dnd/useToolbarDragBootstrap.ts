"use client";

import { useEffect } from "react";

export function useToolbarDragBootstrap() {
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const toolbar =
        target.closest("[data-bez-block-toolbar]") ||
        target.closest("[data-bez-section-toolbar]");

      if (!toolbar) return;

      const nodeEl = toolbar.closest("[data-node-id]");
      if (!nodeEl) return;

      const id = nodeEl.getAttribute("data-node-id");
      if (!id) return;

      window.dispatchEvent(
        new CustomEvent("builder:start-drag", {
          detail: {
            id,
            source: "canvas",
            x: e.clientX,
            y: e.clientY,
          },
        })
      );
    }

    window.addEventListener("mousedown", onMouseDown);
    return () =>
      window.removeEventListener("mousedown", onMouseDown);
  }, []);
}
