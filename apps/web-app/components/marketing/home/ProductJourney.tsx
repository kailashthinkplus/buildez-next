"use client";

import { useEffect, useRef, useState } from "react";

const FRAME_CDN = "/marketing/home-v3";

const STAGES = [
  { no: "01", title: "Design", caption: "Craft responsive pages visually, with every detail in view.", tag: "REAL BUILD EZY OUTPUT", image: "design", alt: "Website created with the Build Ezy visual builder", figcaption: "Build every breakpoint in one place." },
  { no: "02", title: "Launch", caption: "Preview, connect your domain, and publish with confidence.", tag: "LIVE PREVIEW", image: "launch", alt: "Real responsive website preview in Build Ezy", figcaption: "Preview clearly before you publish." },
  { no: "03", title: "Sell", caption: "Turn visits into orders with connected commerce.", tag: "CONNECTED COMMERCE", image: "sell", alt: "Real ecommerce website created with Build Ezy", figcaption: "Products and payments, connected." },
  { no: "04", title: "Grow", caption: "Read live performance and make smarter next moves.", tag: "GROWTH EXPERIENCE", image: "grow", alt: "Real analytics website experience created with Build Ezy", figcaption: "Turn insight into your next move." },
] as const;

export function ProductJourney() {
  const journeyRef = useRef<HTMLElement>(null);
  const [activeJourney, setActiveJourney] = useState(0);

  useEffect(() => {
    let animationFrame = 0;
    const update = () => {
      animationFrame = 0;
      const journey = journeyRef.current;
      if (!journey) return;
      const rect = journey.getBoundingClientRect();
      const travel = Math.max(rect.height - window.innerHeight, 1);
      const progress = Math.max(0, Math.min(1, -rect.top / travel));
      const active = progress < 0.16 ? 0 : progress < 0.5 ? 1 : progress < 0.76 ? 2 : 3;
      setActiveJourney(active);
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
    <section className="frame-journey" aria-label="Build Ezy product journey" ref={journeyRef}>
      <div className="frame-sticky">
        <div className="journey-copy">
          <span className="section-no">SCROLL THROUGH BUILD EZY</span>
          {STAGES.map((stage, index) => (
            <article key={stage.no} className={activeJourney === index ? "active" : ""}>
              <b>{stage.no}</b>
              <h2>{stage.title}</h2>
              <p>{stage.caption}</p>
            </article>
          ))}
        </div>
        <div className="frame-depth-stage">
          {STAGES.map((stage, index) => (
            <figure key={stage.no} className={`depth-frame frame-${index + 1}${activeJourney === index ? " active" : ""}`}>
              <div className="frame-bar">
                <span />
                <i>{stage.tag}</i>
                <b>{stage.no}</b>
              </div>
              <img src={`${FRAME_CDN}/${stage.image}.webp`} alt={stage.alt} width="1200" height="675" loading="lazy" decoding="async" />
              <figcaption>{stage.figcaption}</figcaption>
            </figure>
          ))}
        </div>
        <div className="journey-progress">
          <i />
          <span>Keep scrolling</span>
        </div>
      </div>
    </section>
  );
}
