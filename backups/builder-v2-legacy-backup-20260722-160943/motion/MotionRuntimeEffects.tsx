"use client";

import { useLayoutEffect } from "react";
import type { RuntimeMotionEntry } from "./runtimeMotionEntries";

export default function MotionRuntimeEffects({
  entries,
  rootId,
}: {
  entries: RuntimeMotionEntry[];
  rootId?: string;
}) {
  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = rootId ? document.getElementById(rootId) : document;
    if (!root) return;
    const cleanups: Array<() => void> = [];
    let frame = 0;
    const parallax: Array<{ element: HTMLElement; entry: RuntimeMotionEntry; update(x:number,y:number):void }> = [];



    for (const entry of entries) {
      const escaped = CSS.escape(entry.nodeId);
      const element = root.querySelector<HTMLElement>(
        `[data-node-id="${escaped}"],[data-buildez-node-id="${escaped}"]`
      );
      if (!element) continue;
      element.dataset.motionRuntime = "true";
      const originalTransform = element.style.transform;
      const originalTransition = element.style.transition;
      const originalTransitionDelay = element.style.transitionDelay;

      element.style.transition =
        entry.parallaxHorizontalDistance !== 0 ||
        entry.parallaxVerticalDistance !== 0 ||
        entry.parallaxHorizontal !== 0 ||
        entry.parallaxVertical !== 0 ||
        entry.preset === "parallax"
          ? `opacity ${entry.duration}s ${entry.ease}`
          : originalTransition ||
            `transform ${entry.duration}s ${entry.ease}, opacity ${entry.duration}s ${entry.ease}`;

      element.style.transitionDelay =
        entry.parallaxHorizontalDistance !== 0 ||
        entry.parallaxVerticalDistance !== 0 ||
        entry.parallaxHorizontal !== 0 ||
        entry.parallaxVertical !== 0 ||
        entry.preset === "parallax"
          ? "0s"
          : originalTransitionDelay || `${entry.delay}s`;

      if (entry.pin && !reduceMotion) {
        element.style.position = "sticky";
        element.style.top = `${entry.pinTop}px`;
        element.style.zIndex ||= "2";
      }

      if (entry.trigger === "viewport" && entry.preset !== "none" && !reduceMotion) {
        element.style.animationPlayState = "paused";
        const observer = new IntersectionObserver(([record]) => {
          if (!record?.isIntersecting) return;
          element.style.animationPlayState = "running";
          observer.disconnect();
        }, { threshold: 0.15 });
        observer.observe(element);
        cleanups.push(() => observer.disconnect());
      }

      let hovered = false;
      let pointerX = 0;
      let pointerY = 0;
      let scrollX = 0;
      let scrollY = 0;
      const compose = () => {
        const hoverY = hovered ? entry.hoverTranslateY : 0;
        const scale = hovered ? entry.hoverScale : 1;
        const runtimeTransform =
          `translate3d(${scrollX + pointerX}px, ${scrollY + hoverY + pointerY}px, 0) scale(${scale})`;

        const composedTransform = originalTransform
          ? `${runtimeTransform} ${originalTransform}`
          : runtimeTransform;

        element.style.setProperty(
          "transform",
          composedTransform,
          "important"
        );

        element.style.opacity = String(hovered ? entry.hoverOpacity : 1);
      };
      const enter = () => { hovered = true; compose(); };
      const leave = () => { hovered = false; pointerX = 0; pointerY = 0; compose(); };
      const move = (event: PointerEvent) => {
        if (!entry.mouseStrength || reduceMotion) return;
        const box = element.getBoundingClientRect();
        pointerX = ((event.clientX - box.left) / box.width - 0.5) * entry.mouseStrength;
        pointerY = ((event.clientY - box.top) / box.height - 0.5) * entry.mouseStrength;
        compose();
      };
      element.addEventListener("pointerenter", enter);
      element.addEventListener("pointerleave", leave);
      element.addEventListener("focusin", enter);
      element.addEventListener("focusout", leave);
      element.addEventListener("pointermove", move);
      cleanups.push(() => {
        element.removeEventListener("pointerenter", enter);
        element.removeEventListener("pointerleave", leave);
        element.removeEventListener("focusin", enter);
        element.removeEventListener("focusout", leave);
        element.removeEventListener("pointermove", move);
        if (originalTransform) {
          element.style.transform = originalTransform;
        } else {
          element.style.removeProperty("transform");
        }

        if (originalTransition) {
          element.style.transition = originalTransition;
        } else {
          element.style.removeProperty("transition");
        }

        if (originalTransitionDelay) {
          element.style.transitionDelay = originalTransitionDelay;
        } else {
          element.style.removeProperty("transition-delay");
        }

        element.style.removeProperty("opacity");
      });
      if (
        !reduceMotion &&
        (
          entry.parallaxHorizontalDistance ||
          entry.parallaxVerticalDistance ||
          entry.parallaxHorizontal ||
          entry.parallaxVertical ||
          entry.preset === "parallax"
        )
      ) {
        parallax.push({
          element,
          entry,
          update(x,y) { scrollX=x; scrollY=y; compose(); },
        });
      }
    }

    const updateParallax = () => {
      frame = 0;
      const viewportCenter = window.innerHeight / 2;
      for (const { element, entry, update } of parallax) {
        const box = element.getBoundingClientRect();
        const progress = (box.top + box.height / 2 - viewportCenter) / window.innerHeight;
        const horizontalDistance =
          entry.parallaxHorizontalDistance;

        const verticalDistance =
          entry.parallaxVerticalDistance ||
          (entry.preset === "parallax" ? 40 : 0);

        const xDirection =
          entry.parallaxHorizontalDirection === "right"
            ? 1
            : -1;

        const yDirection =
          entry.parallaxVerticalDirection === "down"
            ? 1
            : -1;

        const x =
          progress *
          horizontalDistance *
          xDirection;

        const y =
          progress *
          verticalDistance *
          yDirection;

        update(x,y);
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateParallax);
    };
    if (parallax.length) {
      document.addEventListener("scroll", onScroll, { passive: true, capture: true });
      window.addEventListener("resize", onScroll);
      updateParallax();
      cleanups.push(() => {
        document.removeEventListener("scroll", onScroll, true);
        window.removeEventListener("resize", onScroll);
        if (frame) window.cancelAnimationFrame(frame);
      });
    }
    return () => cleanups.reverse().forEach((cleanup) => cleanup());
  }, [entries, rootId]);
  return null;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}
function finite(value: unknown, fallback: number) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}
function normalizeEase(value: string) {
  const aliases: Record<string, string> = {
    "power2.out": "cubic-bezier(.22,1,.36,1)",
    "power3.inOut": "cubic-bezier(.65,0,.35,1)",
    "back.out": "cubic-bezier(.34,1.56,.64,1)",
    "elastic.out": "cubic-bezier(.2,1.6,.4,1)",
  };
  return aliases[value] ?? value;
}
