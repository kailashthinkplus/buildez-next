"use client";

import StickyScene from "../motion/StickyScene";
import CinematicSequence from "../cinematic/CinematicSequence";
import { AmbientGlow, ScrollRevealText } from "../motion/primitives";
import { designLaunchSellGrow } from "../cinematic/manifests";

const WORDS = ["Design.", "Launch.", "Sell.", "Grow."];

/**
 * The bridge between the hero and the product journey: one massive
 * statement, built entirely from copy that already exists elsewhere on
 * the page (the footer tagline), with the same journey imagery emerging
 * faintly behind it.
 */
export default function TransitionStatement() {
  return (
    <section className="transition-statement" aria-label="Design, launch, sell, grow">
      <StickyScene length="220vh">
        {(progress) => (
          <div className="transition-inner">
            <CinematicSequence manifest={designLaunchSellGrow} progress={progress} fit="cover" className="transition-bg" />
            <div className="transition-veil" />
            <AmbientGlow className="transition-glow" size={720} blur={200} opacity={0.1} />
            <ScrollRevealText words={WORDS} progress={progress} className="transition-words" />
          </div>
        )}
      </StickyScene>
    </section>
  );
}
