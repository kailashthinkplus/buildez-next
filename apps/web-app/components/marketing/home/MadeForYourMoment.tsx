"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, motion as tokens, prefersReducedMotion } from "@/lib/motion";
import { AmbientGlow } from "@/components/motion/primitives";

const FRAME_CDN = "https://assets.getbuildez.com/marketing/homepage/moment";

const MOMENTS = [
  {
    index: "01",
    eyebrow: "FOR CREATIVE TEAMS",
    title: "Agencies",
    copy: "Move from client brief to polished launch in one connected workspace. Keep every brand distinct while making delivery repeatable.",
    features: ["Multi-site workflows", "Consistent design systems", "Faster client launches"],
    image: "agencies",
    alt: "Creative agency team collaborating on multiple client websites built with Build Ezy",
    glow: "#5987c5",
  },
  {
    index: "02",
    eyebrow: "FOR IDEA OWNERS",
    title: "Solo founders",
    copy: "Turn an idea into a credible business presence without assembling a complicated stack or waiting on multiple specialists.",
    features: ["Launch-ready foundations", "Domains and analytics", "Room to grow"],
    image: "solo-founders",
    alt: "Solo founder building their business website independently with Build Ezy",
    glow: "#e0836f",
  },
  {
    index: "03",
    eyebrow: "FOR INDEPENDENT CREATORS",
    title: "Freelancers",
    copy: "Create standout work, manage client sites, and spend more time on craft instead of repetitive setup and maintenance.",
    features: ["Visual page building", "Reusable brand control", "Professional publishing"],
    image: "freelancers",
    alt: "Freelance designer working on client website design with Build Ezy",
    glow: "#4fc99a",
  },
  {
    index: "04",
    eyebrow: "FOR GROWING OPERATORS",
    title: "Businesses",
    copy: "Bring your website, products, performance, and customer journey together as your operation becomes more ambitious.",
    features: ["Connected commerce", "Live performance insight", "Scalable page management"],
    image: "businesses",
    alt: "Business team reviewing growth dashboard for their Build Ezy website",
    glow: "#e0ab5c",
  },
] as const;

export function MadeForYourMoment() {
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const rail = railRef.current;
    if (!rail) return;
    const rows = Array.from(rail.querySelectorAll<HTMLElement>(".moment-row"));
    const batches = ScrollTrigger.batch(rows, {
      start: "top 84%",
      onEnter: (batch) =>
        gsap.to(batch, { opacity: 1, y: 0, duration: tokens.revealDuration, ease: tokens.revealEase, stagger: 0.12 }),
      onLeaveBack: (batch) => gsap.to(batch, { opacity: 0, y: 44, duration: 0.35, ease: "power2.out", stagger: 0.06 }),
    });
    return () => {
      batches.forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section className="audience-section" id="for-whom">
      <div className="audience-heading reveal">
        <span className="section-no">03 / MADE FOR YOUR MOMENT</span>
        <h2>
          Different ambitions.
          <br />
          <em>One place to build.</em>
        </h2>
        <p>
          Build Ezy adapts to the way you work—whether you are launching your first idea or managing an
          entire client portfolio.
        </p>
      </div>
      <div className="moment-rail" ref={railRef}>
        {MOMENTS.map((moment) => (
          <div key={moment.title} className="moment-row">
            <div className="moment-visual">
              <AmbientGlow className="moment-glow" color={moment.glow} size={420} blur={130} opacity={0.22} />
              <img src={`${FRAME_CDN}/${moment.image}.png`} alt={moment.alt} width="1200" height="675" loading="lazy" decoding="async" />
            </div>
            <div className="moment-copy">
              <span className="moment-index">{moment.index}</span>
              <small>{moment.eyebrow}</small>
              <h3>{moment.title}</h3>
              <p>{moment.copy}</p>
              <ul>
                {moment.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
