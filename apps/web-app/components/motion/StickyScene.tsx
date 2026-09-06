"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, motion as tokens, prefersReducedMotion } from "@/lib/motion";

type StickySceneProps = {
  /** Total scroll distance the scene occupies, e.g. "430vh". */
  length: string;
  /** Render prop — receives scroll progress through the scene, 0..1. */
  children: (progress: number) => ReactNode;
  className?: string;
  scrub?: number;
};

/**
 * Pins its content with native CSS `position: sticky` (no JS-driven pin,
 * so scrolling stays directly connected to the wheel/trackpad) and hands
 * the wrapped scene a smoothed 0..1 progress value via GSAP ScrollTrigger.
 */
export default function StickyScene({ length, children, className, scrub = tokens.scrub }: StickySceneProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    if (prefersReducedMotion()) {
      // progress already defaults to 0 — nothing to animate.
      return;
    }

    const state = { p: 0 };
    const tween = gsap.to(state, {
      p: 1,
      ease: "none",
      scrollTrigger: {
        trigger: wrap,
        start: "top top",
        end: "bottom bottom",
        scrub,
        invalidateOnRefresh: true,
      },
      onUpdate: () => setProgress(state.p),
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [scrub]);

  return (
    <div ref={wrapRef} className={className} style={{ height: length, position: "relative" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        {children(progress)}
      </div>
    </div>
  );
}
