"use client";

import StickyScene from "@/components/motion/StickyScene";
import CinematicSequence from "@/components/cinematic/CinematicSequence";
import { AmbientGlow, ScrollRevealText } from "@/components/motion/primitives";
import { transitionFlythrough } from "@/components/cinematic/manifests";

const WORDS = ["Immersive.", "Cinematic.", "Professional Premium Websites."];

/**
 * The signature transition: the camera crosses through the website itself,
 * bridging the product-journey stages into the wider platform below.
 */
export function ImmersiveShowcase() {
  return (
    <section className="transition-statement" aria-label="Step inside Build Ezy">
      <StickyScene length="220vh">
        {(progress) => (
          <div className="transition-inner">
            <CinematicSequence manifest={transitionFlythrough} progress={progress} fit="cover" className="transition-bg" />
            <div className="transition-veil" />
            <AmbientGlow className="transition-glow" size={720} blur={200} opacity={0.1} />
            <ScrollRevealText words={WORDS} progress={progress} className="transition-words" />
          </div>
        )}
      </StickyScene>
    </section>
  );
}
