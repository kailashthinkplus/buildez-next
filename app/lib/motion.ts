"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  var __be_gsap_registered: boolean | undefined;
}

if (typeof window !== "undefined" && !globalThis.__be_gsap_registered) {
  gsap.registerPlugin(ScrollTrigger);
  globalThis.__be_gsap_registered = true;
}

export { gsap, ScrollTrigger };

/** Shared motion language: heavier, damped, deliberate. No bounce. */
export const motion = {
  scrub: 0.9,
  revealDuration: 1.05,
  revealEase: "power3.out",
  fastDuration: 0.28,
  slowDuration: 1.3,
};

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
