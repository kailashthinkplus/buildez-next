"use client";

import { useEffect, useRef, useState } from "react";
import { OptimizedR2Image } from "./OptimizedR2Image";

const FRAME_CDN = "https://assets.getbuildez.com/marketing/homepage/journey";

const STAGES = [
  { no: "01", title: "Design", caption: "Craft responsive pages visually, with every detail in view.", tag: "REAL BUILD EZY OUTPUT", image: "design", alt: "Designer building a website visually with Build Ezy", figcaption: "Build every breakpoint in one place." },
  { no: "02", title: "Launch", caption: "Preview, connect your domain, and publish with confidence.", tag: "LIVE PREVIEW", image: "launch", alt: "Founder celebrating their freshly published Build Ezy website", figcaption: "Preview clearly before you publish." },
  { no: "03", title: "Sell", caption: "Turn visits into orders with connected commerce.", tag: "CONNECTED COMMERCE", image: "sell", alt: "Entrepreneur managing orders from their Build Ezy store", figcaption: "Products and payments, connected." },
  { no: "04", title: "Grow", caption: "Read live performance and make smarter next moves.", tag: "GROWTH EXPERIENCE", image: "grow", alt: "Business owner reviewing growth analytics for their Build Ezy site", figcaption: "Turn insight into your next move." },
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
              <OptimizedR2Image basePath={`${FRAME_CDN}/${stage.image}`} alt={stage.alt} />
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
