"use client";

import StickyScene from "../motion/StickyScene";

const STAGES = [
  {
    n: "01",
    title: "Design",
    copy: "Craft responsive pages visually, with every detail in view.",
    tag: "LIVE CANVAS",
    img: "/frame-design.png",
    alt: "Build Ezy visual website editor",
    caption: "Build every breakpoint in one place.",
  },
  {
    n: "02",
    title: "Launch",
    copy: "Preview, connect your domain, and publish with confidence.",
    tag: "BRAND SYSTEM",
    img: "/frame-brand.png",
    alt: "A polished site created in Build Ezy",
    caption: "Your identity, consistent everywhere.",
  },
  {
    n: "03",
    title: "Sell",
    copy: "Turn visits into orders with connected commerce.",
    tag: "COMMERCE",
    img: "/frame-commerce.png",
    alt: "Commerce experience built with Build Ezy",
    caption: "Products and payments, connected.",
  },
  {
    n: "04",
    title: "Grow",
    copy: "Read live performance and make smarter next moves.",
    tag: "PERFORMANCE",
    img: "/frame-grow.png",
    alt: "Growth focused website experience",
    caption: "See what moves your business.",
  },
];

export default function FrameJourney() {
  return (
    <section className="frame-journey" aria-label="Build Ezy product journey">
      <StickyScene length="430vh" className="frame-sticky-wrap">
        {(progress) => {
          const active = Math.min(3, Math.floor(progress * 4.25));
          return (
            <div className="frame-sticky">
              <div className="journey-copy">
                <span className="section-no">SCROLL THROUGH BUILD EZY</span>
                {STAGES.map((s, i) => (
                  <article key={s.title} className={i === active ? "active" : ""}>
                    <b>{s.n}</b>
                    <h2>{s.title}</h2>
                    <p>{s.copy}</p>
                  </article>
                ))}
              </div>
              <div className="frame-depth-stage">
                {STAGES.map((s, i) => {
                  const start = i * 0.2;
                  const enter = Math.max(0, Math.min(1, (progress - start) / 0.18));
                  const exit = Math.max(0, Math.min(1, (progress - start - 0.22) / 0.16));
                  const side = i % 2 === 0 ? -1 : 1;
                  const x = side * (1 - enter) * 42 + side * exit * 18;
                  const y = (1 - enter) * 36 - exit * 18;
                  const z = -1050 * (1 - enter) + exit * 330;
                  const rotateY = side * (1 - enter) * -34 + side * exit * 13;
                  const rotateX = (1 - enter) * 12 - exit * 5;
                  const opacity = Math.min(1, enter * 1.8) * (1 - exit * 0.72);
                  return (
                    <figure
                      key={s.title}
                      className={`depth-frame frame-${i + 1}`}
                      style={{
                        transform: `translate(-50%,-50%) translate3d(${x}vw, ${y}vh, ${z}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
                        opacity,
                      }}
                    >
                      <div className="frame-bar">
                        <span />
                        <i>{s.tag}</i>
                        <b>{s.n}</b>
                      </div>
                      <img src={s.img} alt={s.alt} />
                      <figcaption>{s.caption}</figcaption>
                    </figure>
                  );
                })}
              </div>
              <div className="journey-progress">
                <i />
                <span>Keep scrolling</span>
              </div>
            </div>
          );
        }}
      </StickyScene>
    </section>
  );
}
