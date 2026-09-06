"use client";

import { useEffect, useRef } from "react";

const CAPABILITIES = [
  { index: "01", glyph: "✦", title: "Visual Builder", copy: "Shape responsive pages with precise, direct controls.", cardClass: "card-design" },
  { index: "02", glyph: "✧", title: "AI Agents", copy: "Put intelligent assistants to work across your business.", cardClass: "card-pages" },
  { index: "03", glyph: "◇", title: "CRM", copy: "Keep leads, customers, and conversations connected.", cardClass: "card-store" },
  { index: "04", glyph: "⌁", title: "Business Intelligence", copy: "Turn live signals into clear, actionable decisions.", cardClass: "card-insights" },
  { index: "05", glyph: "◎", title: "Smart Commerce", copy: "Run products, orders, and payments in one flow.", cardClass: "card-domain" },
] as const;

export function PlatformOrbit() {
  const orbitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orbit = orbitRef.current;
    if (!orbit) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compactDevice = window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
    if (reducedMotion || compactDevice) return;

    let animationFrame = 0;
    const update = () => {
      animationFrame = 0;
      const orbitRect = orbit.getBoundingClientRect();
      const orbitProgress = Math.max(
        0,
        Math.min(1, (window.innerHeight - orbitRect.top) / Math.max(window.innerHeight + orbitRect.height, 1)),
      );
      const turn = orbitProgress * Math.PI * 2;
      orbit.querySelectorAll<HTMLElement>(".orbit-card").forEach((card, index) => {
        const angle = turn + index * 1.18;
        const x = Math.sin(angle) * 17;
        const y = Math.cos(angle) * 11;
        const z = Math.sin(angle + 0.8) * 105;
        const centered = card.classList.contains("card-domain") ? "translateX(-50%) " : "";
        card.style.transform = `${centered}translate3d(${x}px, ${y}px, ${z}px) rotateY(${Math.sin(angle) * 5}deg)`;
        card.style.zIndex = `${Math.round(120 + z)}`;
      });
      const core = orbit.querySelector<HTMLElement>(".core");
      if (core) {
        core.style.transform = `translate(-50%, -50%) rotateX(${8 - orbitProgress * 13}deg) rotateY(${-18 + orbitProgress * 36}deg) translateZ(${Math.sin(turn) * 24}px)`;
      }
      const outerRing = orbit.querySelector<HTMLElement>(".orbit-a");
      const innerRing = orbit.querySelector<HTMLElement>(".orbit-b");
      if (outerRing) outerRing.style.transform = `translate(-50%, -50%) rotateX(66deg) rotateZ(${-8 + orbitProgress * 34}deg)`;
      if (innerRing) innerRing.style.transform = `translate(-50%, -50%) rotateX(66deg) rotateZ(${22 - orbitProgress * 46}deg)`;
    };
    const onScroll = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <section className="platform-section" id="platform">
      <div className="section-heading reveal">
        <span className="section-no">01 / THE PLATFORM</span>
        <h2>
          One connected world.
          <br />
          <em>Every tool in orbit.</em>
        </h2>
        <p>
          Build Ezy brings the whole website journey into one clear system—from the first page to the
          first customer and every insight after.
        </p>
      </div>
      <div className="orbit-stage reveal" ref={orbitRef}>
        <div className="orbit-line orbit-a" />
        <div className="orbit-line orbit-b" />
        <div className="core">
          <img className="official-logo core-logo" src="/buildez-logo-dark.svg" alt="BuildEzy" />
          <small>YOUR DIGITAL HQ</small>
        </div>
        {CAPABILITIES.map((capability) => (
          <article key={capability.title} className={`orbit-card ${capability.cardClass}`}>
            <span>{capability.index}</span>
            <i>{capability.glyph}</i>
            <h3>{capability.title}</h3>
            <p>{capability.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
