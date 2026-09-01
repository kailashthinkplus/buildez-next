"use client";

import { useEffect, useRef } from "react";

const Arrow = () => <span aria-hidden="true">↗</span>;

export default function Home() {
  const stageRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const move = (event: PointerEvent) => {
      stage.style.setProperty("--mx", `${(event.clientX / innerWidth - 0.5) * 2}`);
      stage.style.setProperty("--my", `${(event.clientY / innerHeight - 0.5) * 2}`);
    };
    window.addEventListener("pointermove", move, { passive: true });
    const scroll = () => {
      document.documentElement.style.setProperty("--scroll", `${window.scrollY}`);
      const journey = document.querySelector<HTMLElement>(".frame-journey");
      if (!journey) return;
      const rect = journey.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height - innerHeight, 1)));
      journey.querySelectorAll<HTMLElement>(".depth-frame").forEach((frame, index) => {
        const start = index * .2;
        const enter = Math.max(0, Math.min(1, (progress - start) / .18));
        const exit = Math.max(0, Math.min(1, (progress - start - .22) / .16));
        const side = index % 2 === 0 ? -1 : 1;
        const x = side * (1 - enter) * 42 + side * exit * 18;
        const y = (1 - enter) * 36 - exit * 18;
        const z = -1050 * (1 - enter) + exit * 330;
        const rotateY = side * (1 - enter) * -34 + side * exit * 13;
        frame.style.transform = `translate(-50%, -50%) translate3d(${x}vw, ${y}vh, ${z}px) rotateY(${rotateY}deg) rotateX(${(1-enter)*12-exit*5}deg)`;
        frame.style.opacity = `${Math.min(1, enter * 1.8) * (1 - exit * .72)}`;
      });
      const active = Math.min(3, Math.floor(progress * 4.25));
      journey.querySelectorAll(".journey-copy article").forEach((item, index) => item.classList.toggle("active", index === active));
    };
    window.addEventListener("scroll", scroll, { passive: true });
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")), { threshold: .15 });
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    scroll();
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("scroll", scroll); observer.disconnect(); };
  }, []);

  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Main navigation">
        <a href="#top" className="brand" aria-label="Build Ezy home"><img className="official-logo" src="/buildez-logo-dark.svg" alt="Build Ezy" /></a>
        <div className="nav-links"><a href="#platform">Platform</a><a href="#difference">Why Build Ezy</a><a href="#workflow">How it works</a></div>
        <div className="nav-actions"><a href="/app/login" className="login-link">Log in</a><a href="/app/onboarding" className="mini-cta">Start building <Arrow /></a></div>
      </nav>
      <section className="hero" id="top" ref={stageRef}>
        <div className="hero-glow" /><div className="orb orb-one" /><div className="orb orb-two" />
        <div className="hero-copy">
          <div className="eyebrow"><span /> The complete website operating system</div>
          <h1>Your idea.<br/><em>Built alive.</em></h1>
          <p>Design, launch, sell, and grow from one beautifully connected workspace. Build Ezy turns ambitious ideas into high-performing digital experiences—without the usual complexity.</p>
          <div className="hero-actions"><a href="/app/onboarding" className="primary-cta">Build your first site <Arrow /></a><a href="#platform" className="text-cta">Explore the platform <span>↓</span></a></div>
          <div className="trust-line"><span className="avatar-stack"><i>AR</i><i>MK</i><i>SL</i></span><span><b>Everything you need.</b><br/>Nothing you don’t.</span></div>
        </div>
        <div className="world" aria-label="Interactive preview of the Build Ezy workspace">
          <div className="world-shadow" />
          <div className="dashboard-card layer-back">
            <div className="dash-top"><span className="tiny-logo">B</span><span>Workspace</span><i/><i/><b>Publish</b></div>
            <div className="dash-body"><aside><span className="active"/><span/><span/><span/><span/></aside><div className="canvas"><div className="canvas-nav"><b>FORMA</b><span>Studio&nbsp;&nbsp; Work&nbsp;&nbsp; Journal</span></div><div className="canvas-copy"><small>Independent design studio</small><strong>Spaces that<br/>move with you.</strong><button>View projects</button></div><div className="architecture"><i/><i/><i/><i/></div></div><div className="properties"><small>DESIGN</small><b>Hero section</b><label>LAYOUT</label><span/><span/><label>STYLE</label><div/></div></div>
          </div>
          <div className="float-card analytics-card"><div><span className="status-dot"/> Live performance</div><strong>12.8k</strong><small>Visitors this month <b>+28%</b></small><div className="spark"><i/><i/><i/><i/><i/><i/><i/><i/></div></div>
          <div className="float-card commerce-card"><span className="commerce-icon">◇</span><div><small>NEW ORDER</small><strong>₹4,250.00</strong><p>Payment confirmed</p></div><b>✓</b></div>
          <div className="cursor-tag"><span>↖</span> You’re in control</div>
        </div>
        <div className="scroll-cue"><span>SCROLL TO EXPLORE</span><i/></div>
      </section>

      <section className="frame-journey" aria-label="Build Ezy product journey">
        <div className="frame-sticky">
          <div className="journey-copy">
            <span className="section-no">SCROLL THROUGH BUILD EZY</span>
            <article className="active"><b>01</b><h2>Design</h2><p>Craft responsive pages visually, with every detail in view.</p></article>
            <article><b>02</b><h2>Launch</h2><p>Preview, connect your domain, and publish with confidence.</p></article>
            <article><b>03</b><h2>Sell</h2><p>Turn visits into orders with connected commerce.</p></article>
            <article><b>04</b><h2>Grow</h2><p>Read live performance and make smarter next moves.</p></article>
          </div>
          <div className="frame-depth-stage">
            <figure className="depth-frame frame-1"><div className="frame-bar"><span/><i>LIVE CANVAS</i><b>01</b></div><img src="/frame-design.png" alt="Build Ezy visual website editor"/><figcaption>Build every breakpoint in one place.</figcaption></figure>
            <figure className="depth-frame frame-2"><div className="frame-bar"><span/><i>BRAND SYSTEM</i><b>02</b></div><img src="/frame-brand.png" alt="A polished site created in Build Ezy"/><figcaption>Your identity, consistent everywhere.</figcaption></figure>
            <figure className="depth-frame frame-3"><div className="frame-bar"><span/><i>COMMERCE</i><b>03</b></div><img src="/frame-commerce.png" alt="Commerce experience built with Build Ezy"/><figcaption>Products and payments, connected.</figcaption></figure>
            <figure className="depth-frame frame-4"><div className="frame-bar"><span/><i>PERFORMANCE</i><b>04</b></div><img src="/frame-grow.png" alt="Growth focused website experience"/><figcaption>See what moves your business.</figcaption></figure>
          </div>
          <div className="journey-progress"><i/><span>Keep scrolling</span></div>
        </div>
      </section>

      <section className="platform-section" id="platform">
        <div className="section-heading reveal"><span className="section-no">01 / THE PLATFORM</span><h2>One connected world.<br/><em>Every tool in orbit.</em></h2><p>Build Ezy brings the whole website journey into one clear system—from the first page to the first customer and every insight after.</p></div>
        <div className="orbit-stage reveal">
          <div className="orbit-line orbit-a"/><div className="orbit-line orbit-b"/>
          <div className="core"><img className="official-logo core-logo" src="/buildez-logo-dark.svg" alt="Build Ezy" /><small>YOUR DIGITAL HQ</small></div>
          <article className="orbit-card card-design"><span>01</span><i>✦</i><h3>Visual Builder</h3><p>Shape responsive pages with precise, direct controls.</p></article>
          <article className="orbit-card card-pages"><span>02</span><i>▤</i><h3>Pages & Content</h3><p>Organize every story, campaign, and destination.</p></article>
          <article className="orbit-card card-store"><span>03</span><i>◇</i><h3>Commerce</h3><p>Products, secure checkout, orders, and payments.</p></article>
          <article className="orbit-card card-insights"><span>04</span><i>⌁</i><h3>Live Insights</h3><p>See what people visit, click, and care about.</p></article>
          <article className="orbit-card card-domain"><span>05</span><i>◎</i><h3>Domains & Launch</h3><p>Connect your address and publish with confidence.</p></article>
        </div>
      </section>

      <section className="craft-section" id="workflow">
        <div className="craft-scene reveal">
          <div className="craft-card craft-back"><div className="fake-header"><i/><span/><b/></div><div className="fake-grid"><i/><i/><i/><i/></div></div>
          <div className="craft-card craft-front"><span className="selection-tag">Live canvas</span><div className="portfolio-copy"><small>NEW COLLECTION</small><strong>Objects for<br/>quiet living.</strong><button>Discover the edit</button></div><div className="product-shape"><i/><i/><i/></div></div>
          <div className="tool-pill tool-one">↔ Responsive by default</div><div className="tool-pill tool-two">✓ Ready to publish</div>
        </div>
        <div className="craft-copy reveal"><span className="section-no">02 / FROM IDEA TO LIVE</span><h2>Make it yours.<br/><em>See it instantly.</em></h2><p>Start with a blank canvas or a proven foundation, then refine every detail in context. Layout, type, color, media, motion, and mobile behavior stay close at hand.</p><ul><li><b>01</b><span><strong>Build visually</strong>Work directly on the page you’re creating.</span></li><li><b>02</b><span><strong>Stay on brand</strong>Keep colors, type, and components consistent everywhere.</span></li><li><b>03</b><span><strong>Go live cleanly</strong>Preview every breakpoint, connect a domain, and publish.</span></li></ul></div>
      </section>

      <section className="difference-section" id="difference">
        <div className="difference-head reveal"><span className="section-no">03 / WHY BUILD EZY</span><h2>Less stitching.<br/><em>More momentum.</em></h2></div>
        <div className="difference-grid">
          <article className="difference-card wide reveal"><span className="card-index">01</span><div className="flow-visual"><i>Design</i><b>→</b><i>Publish</i><b>→</b><i>Grow</i></div><h3>One flow, end to end.</h3><p>No scattered handoffs or disconnected dashboards. Your pages, store, audience, domains, and performance move together.</p></article>
          <article className="difference-card reveal"><span className="card-index">02</span><div className="speed-visual"><strong>1</strong><span>workspace<br/>to run it all</span></div><h3>Fast without feeling generic.</h3><p>Move from concept to launch quickly while keeping the craft, control, and character your brand deserves.</p></article>
          <article className="difference-card reveal"><span className="card-index">03</span><div className="ownership-visual"><i/><i/><i/><b>YOU</b></div><h3>Built around your ownership.</h3><p>Your brand, customer relationships, content, and decisions remain at the center—not buried behind platform complexity.</p></article>
          <article className="difference-card wide reveal"><span className="card-index">04</span><div className="scale-visual"><i/><i/><i/><i/><i/></div><h3>Simple on day one. Serious at scale.</h3><p>Launch one polished page today, then expand into rich content, commerce, analytics, domains, and a full digital operation without rebuilding your foundation.</p></article>
        </div>
      </section>

      <section className="final-cta reveal">
        <div className="cta-rings"><i/><i/><i/><i/></div><div className="cta-core"><img src="/buildez-logo-dark.svg" alt="Build Ezy" /></div>
        <span className="section-no">YOUR NEXT CHAPTER STARTS HERE</span><h2>Build something<br/><em>people remember.</em></h2><p>Bring your website, business, and growth into one beautifully connected place.</p>
        <div className="final-actions"><a href="/app/onboarding" className="primary-cta">Create your account <Arrow/></a><a href="/app/login" className="secondary-cta">Log in to Build Ezy</a></div><small>No complicated setup. Start building in minutes.</small>
      </section>

      <footer><a href="#top" className="brand"><img className="official-logo" src="/buildez-logo-dark.svg" alt="Build Ezy" /></a><p>Design. Launch. Sell. Grow.</p><div><a href="#platform">Platform</a><a href="#difference">Why Build Ezy</a><a href="/app/login">Log in</a></div><span>© 2026 Build Ezy</span></footer>
    </main>
  );
}
