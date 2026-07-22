"use client";

import { useEffect, useState } from "react";
import { useSelectionStore } from "../store/useSelectionStore";

export function useSelectionRect() {
  const selectedNodeId = useSelectionStore(
    (s) => s.selectedNodeId
  );

  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!selectedNodeId) {
      setRect(null);
      return;
    }

    let frame = 0;

    const update = () => {
      const element = document.querySelector(
        `[data-node-id="${selectedNodeId}"]`
      ) as HTMLElement | null;

      if (!element) {
        setRect(null);
        return;
      }

      setRect(element.getBoundingClientRect());
    };

    update();

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    window.addEventListener("resize", schedule, {
      passive: true,
    });

    window.addEventListener("scroll", schedule, true);

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener(
        "resize",
        schedule
      );

      window.removeEventListener(
        "scroll",
        schedule,
        true
      );
    };
  }, [selectedNodeId]);

  return rect;
}