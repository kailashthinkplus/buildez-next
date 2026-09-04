"use client";

import { useGlobalScrollFx, ScrollProgress } from "./components/motion/primitives";
import SiteHeader from "./components/sections/SiteHeader";
import Hero from "./components/sections/Hero";
import TransitionStatement from "./components/sections/TransitionStatement";
import FrameJourney from "./components/sections/FrameJourney";
import PlatformOrbit from "./components/sections/PlatformOrbit";
import CraftSection from "./components/sections/CraftSection";
import DifferenceSection from "./components/sections/DifferenceSection";
import FinalCtaFooter from "./components/sections/FinalCtaFooter";

export default function Home() {
  useGlobalScrollFx();

  return (
    <main className="site-shell">
      <ScrollProgress />
      <SiteHeader />
      <Hero />
      <TransitionStatement />
      <FrameJourney />
      <PlatformOrbit />
      <CraftSection />
      <DifferenceSection />
      <FinalCtaFooter />
    </main>
  );
}
