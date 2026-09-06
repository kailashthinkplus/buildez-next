"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { usePointerParallax } from "@/components/motion/primitives";
import { logMarketingCtaClick } from "@/modules/legal/MarketingAnalytics";
import { Arrow } from "./Arrow";
import { OptimizedR2Image } from "./OptimizedR2Image";

const HERO_BANNER_IMAGE = "https://assets.getbuildez.com/marketing/homepage/hero/developer-building";

export function Hero() {
  const stageRef = useRef<HTMLElement>(null);
  usePointerParallax(stageRef);

  return (
    <section className="hero" id="top" ref={stageRef}>
      <div className="hero-glow" aria-hidden="true" />
      <div className="orb orb-one" aria-hidden="true" />
      <div className="orb orb-two" aria-hidden="true" />
      <div className="hero-copy">
        <div className="eyebrow">
          <span /> The complete website operating system
        </div>
        <h1>
          Your idea.
          <br />
          <em>Built alive.</em>
        </h1>
        <p>
          Design, launch, sell, and grow from one beautifully connected workspace. Build Ezy turns
          ambitious ideas into high-performing digital experiences—without the usual complexity.
        </p>
        <div className="hero-actions">
          <Link href="/app/signup" className="primary-cta" onClick={() => logMarketingCtaClick("hero_primary")}>
            Build Your First Site <Arrow />
          </Link>
          <a href="#platform" className="text-cta">
            Explore the Platform <ArrowDown size={15} aria-hidden="true" />
          </a>
        </div>
        <div className="trust-line">
          <span className="avatar-stack">
            <Image src="/marketing/home-v3/avatars/designer.webp" alt="" width={76} height={76} />
            <Image src="/marketing/home-v3/avatars/agency-owner.webp" alt="" width={76} height={76} />
            <Image src="/marketing/home-v3/avatars/business-owner.webp" alt="" width={76} height={76} />
          </span>
          <span>
            <b>Loved by designers,</b>
            <br />
            agencies &amp; business owners.
          </span>
        </div>
      </div>
      <div className="hero-banner">
        <OptimizedR2Image
          className="hero-banner-image"
          basePath={HERO_BANNER_IMAGE}
          alt="A developer building a professional website with Build Ezy's visual website builder"
          loading="eager"
          fetchPriority="high"
        />
      </div>
      <div className="scroll-cue" aria-hidden="true">
        <span>SCROLL TO EXPLORE</span>
        <i />
      </div>
    </section>
  );
}
