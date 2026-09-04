"use client";

import { useRef } from "react";
import { usePointerParallax, MagneticButton } from "../motion/primitives";

const Arrow = () => <span aria-hidden="true">↗</span>;

export default function Hero() {
  const stageRef = useRef<HTMLElement>(null);
  usePointerParallax(stageRef);

  return (
    <section className="hero" id="top" ref={stageRef}>
      <div className="hero-glow" />
      <div className="orb orb-one" />
      <div className="orb orb-two" />
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
          <MagneticButton href="/app/onboarding" className="primary-cta" strength={4}>
            Build Your First Site <Arrow />
          </MagneticButton>
          <a href="#platform" className="text-cta">
            Explore the Platform <span>↓</span>
          </a>
        </div>
        <div className="trust-line">
          <span className="avatar-stack">
            <i>AR</i>
            <i>MK</i>
            <i>SL</i>
          </span>
          <span>
            <b>Everything you need.</b>
            <br />
            Nothing you don&rsquo;t.
          </span>
        </div>
      </div>
      <div className="world" aria-label="Interactive preview of the Build Ezy workspace">
        <div className="world-shadow" />
        <div className="dashboard-card layer-back">
          <div className="dash-top">
            <span className="tiny-logo">B</span>
            <span>Workspace</span>
            <i />
            <i />
            <b>Publish</b>
          </div>
          <div className="dash-body">
            <aside>
              <span className="active" />
              <span />
              <span />
              <span />
              <span />
            </aside>
            <div className="canvas">
              <div className="canvas-nav">
                <b>FORMA</b>
                <span>Studio&nbsp;&nbsp; Work&nbsp;&nbsp; Journal</span>
              </div>
              <div className="canvas-copy">
                <small>Independent design studio</small>
                <strong>
                  Spaces that
                  <br />
                  move with you.
                </strong>
                <button>View projects</button>
              </div>
              <div className="architecture">
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="properties">
              <small>DESIGN</small>
              <b>Hero section</b>
              <label>LAYOUT</label>
              <span />
              <span />
              <label>STYLE</label>
              <div />
            </div>
          </div>
        </div>
        <div className="float-card analytics-card">
          <div>
            <span className="status-dot" /> Live performance
          </div>
          <strong>12.8k</strong>
          <small>
            Visitors this month <b>+28%</b>
          </small>
          <div className="spark">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="float-card commerce-card">
          <span className="commerce-icon">◇</span>
          <div>
            <small>NEW ORDER</small>
            <strong>₹4,250.00</strong>
            <p>Payment confirmed</p>
          </div>
          <b>✓</b>
        </div>
        <div className="cursor-tag">
          <span>↖</span> You&rsquo;re in control
        </div>
      </div>
      <div className="scroll-cue">
        <span>SCROLL TO EXPLORE</span>
        <i />
      </div>
    </section>
  );
}
