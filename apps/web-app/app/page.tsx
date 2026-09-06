"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { CookieConsentBanner } from "@/modules/legal/CookieConsentBanner";
import { MarketingAnalytics, notifyAnalyticsConsentGranted } from "@/modules/legal/MarketingAnalytics";
import "./marketing.css";

const Arrow = () => <svg className="cta-arrow" aria-hidden="true" viewBox="0 0 20 20"><path d="M3 10h13M11 5l5 5-5 5"/></svg>;

const FRAME_CDN = "/marketing/home-v3";

export default function Home() {
  const stageRef = useRef<HTMLElement>(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [sitePrompt, setSitePrompt] = useState("");
  const [activeJourney, setActiveJourney] = useState(0);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compactDevice = window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
    const move = (event: PointerEvent) => {
      stage.style.setProperty("--mx", `${(event.clientX / innerWidth - 0.5) * 2}`);
      stage.style.setProperty("--my", `${(event.clientY / innerHeight - 0.5) * 2}`);
    };
    if (!compactDevice && !reducedMotion) window.addEventListener("pointermove", move, { passive: true });
    let animationFrame = 0;
    const updateScrollEffects = () => {
      animationFrame = 0;
      setHeaderScrolled(window.scrollY > 32);
      if (!compactDevice && !reducedMotion) document.documentElement.style.setProperty("--scroll", `${window.scrollY}`);
      const journey = document.querySelector<HTMLElement>(".frame-journey");
      if (!journey) return;
      const rect = journey.getBoundingClientRect();
      const travel = Math.max(rect.height - innerHeight, 1);
      const progress = Math.max(0, Math.min(1, -rect.top / travel));
      const active = progress < 0.16 ? 0 : progress < 0.5 ? 1 : progress < 0.76 ? 2 : 3;
      setActiveJourney(active);

      const orbit = document.querySelector<HTMLElement>(".orbit-stage");
      if (orbit && !compactDevice && !reducedMotion) {
        const orbitRect = orbit.getBoundingClientRect();
        const orbitProgress = Math.max(0, Math.min(1, (innerHeight - orbitRect.top) / Math.max(innerHeight + orbitRect.height, 1)));
        const turn = orbitProgress * Math.PI * 2;
        orbit.querySelectorAll<HTMLElement>(".orbit-card").forEach((card, index) => {
          const angle = turn + index * 1.18;
          const x = Math.sin(angle) * 17;
          const y = Math.cos(angle) * 11;
          const z = Math.sin(angle + .8) * 105;
          const centered = card.classList.contains("card-domain") ? "translateX(-50%) " : "";
          card.style.transform = `${centered}translate3d(${x}px, ${y}px, ${z}px) rotateY(${Math.sin(angle) * 5}deg)`;
          card.style.zIndex = `${Math.round(120 + z)}`;
        });
        const core = orbit.querySelector<HTMLElement>(".core");
        if (core) core.style.transform = `translate(-50%, -50%) rotateX(${8 - orbitProgress * 13}deg) rotateY(${-18 + orbitProgress * 36}deg) translateZ(${Math.sin(turn) * 24}px)`;
        const outerRing = orbit.querySelector<HTMLElement>(".orbit-a");
        const innerRing = orbit.querySelector<HTMLElement>(".orbit-b");
        if (outerRing) outerRing.style.transform = `translate(-50%, -50%) rotateX(66deg) rotateZ(${-8 + orbitProgress * 34}deg)`;
        if (innerRing) innerRing.style.transform = `translate(-50%, -50%) rotateX(66deg) rotateZ(${22 - orbitProgress * 46}deg)`;
      }
    };
    const scroll = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateScrollEffects);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")), { threshold: .15 });
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    updateScrollEffects();
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", scroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    setMenuMounted(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <main className="buildezy-marketing site-shell" ref={stageRef}>
      <nav className={`topbar${headerScrolled ? " is-scrolled" : ""}`} aria-label="Main navigation">
        <button
          type="button"
          className={`marketing-mobile-menu-toggle${menuOpen ? " is-open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <svg className="marketing-menu-icon marketing-menu-icon-bars" viewBox="0 0 20 14" fill="none" aria-hidden="true">
            <rect x="0" y="0" width="20" height="2.6" rx="1.3" fill="currentColor" />
            <rect x="0" y="5.7" width="20" height="2.6" rx="1.3" fill="currentColor" />
            <rect x="0" y="11.4" width="11" height="2.6" rx="1.3" fill="currentColor" />
          </svg>
          <svg className="marketing-menu-icon marketing-menu-icon-close" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
        <a href="#top" className="brand" aria-label="BuildEzy home"><img className="official-logo" src="/buildez-logo-dark.svg" alt="BuildEzy" /></a>
        <div className="nav-links"><a href="#platform">Platform</a><a href="/pricing">Pricing</a><a href="#difference">Why Build Ezy</a><a href="#workflow">How it works</a></div>
        <div className="nav-actions"><a href="/app/login" className="login-link">Log In</a><a href="/app/signup" className="mini-cta">Signup <Arrow /></a></div>
      </nav>
      {menuMounted
        ? createPortal(
            <>
              <div
                className={`marketing-mobile-menu-backdrop${menuOpen ? " is-open" : ""}`}
                onClick={() => setMenuOpen(false)}
              />
              <nav
                aria-label="Mobile navigation"
                className={`marketing-mobile-menu${menuOpen ? " is-open" : ""}`}
                aria-hidden={!menuOpen}
              >
                <a href="#top" className="marketing-mobile-menu-brand" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>
                  <img src="/buildez-logo-dark.svg" alt="BuildEzy" />
                </a>
                <a href="#platform" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>Platform</a>
                <a href="/pricing" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>Pricing</a>
                <a href="#difference" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>Why Build Ezy</a>
                <a href="#workflow" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>How it works</a>
                <div className="marketing-mobile-menu-divider" />
                <a href="/app/login" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>Log in</a>
                <a href="/app/signup" className="marketing-mobile-menu-cta" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>Signup</a>
              </nav>
            </>,
            document.body,
          )
        : null}
      <section className="hero" id="top">
        <div className="hero-glow" /><div className="orb orb-one" /><div className="orb orb-two" />
        <div className="hero-copy">
          <div className="eyebrow"><span /> The complete website operating system</div>
          <h1>Your idea.<br/><em>Built alive.</em></h1>
          <p>Design, launch, sell, and grow from one beautifully connected workspace. Build Ezy turns ambitious ideas into high-performing digital experiences—without the usual complexity.</p>
          <div className="hero-actions"><a href="/app/signup" className="primary-cta">Build Your First Site <Arrow /></a><a href="#platform" className="text-cta">Explore the Platform <span>↓</span></a></div>
          <div className="trust-line"><span className="avatar-stack"><img src="https://randomuser.me/api/portraits/women/51.jpg" alt="" /><img src="https://randomuser.me/api/portraits/men/69.jpg" alt="" /><img src="https://randomuser.me/api/portraits/women/85.jpg" alt="" /></span><span><b>Loved by designers,</b><br/>agencies &amp; business owners.</span></div>
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

      <section className="prompt-builder" aria-labelledby="prompt-builder-title">
        <div className="prompt-heading reveal"><span className="section-no">BUILD WITH AI</span><h2 id="prompt-builder-title">Describe the idea.<br/><em>Watch it become a website.</em></h2><p>Tell Build Ezy what you want to launch. Start with a sentence, then shape every detail visually.</p></div>
        <form className="prompt-shell reveal" onSubmit={(event) => { event.preventDefault(); const value = sitePrompt.trim(); if (value) window.location.href = `/app/signup?prompt=${encodeURIComponent(value)}`; }}>
          <div className="prompt-glow" aria-hidden="true" />
          <span className="prompt-mode"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M3 10h14M10 3c2.4 2.1 3.5 4.4 3.5 7S12.4 14.9 10 17M10 3C7.6 5.1 6.5 7.4 6.5 10S7.6 14.9 10 17"/></svg> Website</span>
          <textarea aria-label="Describe the website you want to build" value={sitePrompt} onChange={(event) => setSitePrompt(event.target.value)} placeholder="A modern company website with clear services, strong proof, and a premium visual identity…" rows={2}/>
          <button className="prompt-submit" type="submit" aria-label="Start building from this description" disabled={!sitePrompt.trim()}><Arrow /></button>
        </form>
        <div className="prompt-suggestions reveal" aria-label="Prompt suggestions">{["Business Website", "Product Landing Page", "Portfolio", "Startup Launch"].map((suggestion) => <button key={suggestion} type="button" onClick={() => setSitePrompt(`Create a premium ${suggestion.toLowerCase()} with a clear story, responsive layout, and strong calls to action.`)}>{suggestion}</button>)}</div>
      </section>

      <section className="frame-journey" aria-label="Build Ezy product journey">
        <div className="frame-sticky">
          <div className="journey-copy">
            <span className="section-no">SCROLL THROUGH BUILD EZY</span>
            <article className={activeJourney === 0 ? "active" : ""}><b>01</b><h2>Design</h2><p>Craft responsive pages visually, with every detail in view.</p></article>
            <article className={activeJourney === 1 ? "active" : ""}><b>02</b><h2>Launch</h2><p>Preview, connect your domain, and publish with confidence.</p></article>
            <article className={activeJourney === 2 ? "active" : ""}><b>03</b><h2>Sell</h2><p>Turn visits into orders with connected commerce.</p></article>
            <article className={activeJourney === 3 ? "active" : ""}><b>04</b><h2>Grow</h2><p>Read live performance and make smarter next moves.</p></article>
          </div>
          <div className="frame-depth-stage">
            <figure className={`depth-frame frame-1${activeJourney === 0 ? " active" : ""}`}><div className="frame-bar"><span/><i>REAL BUILD EZY OUTPUT</i><b>01</b></div><img src={`${FRAME_CDN}/design.webp`} alt="Website created with the Build Ezy visual builder" width="1200" height="675" loading="lazy" decoding="async"/><figcaption>Build every breakpoint in one place.</figcaption></figure>
            <figure className={`depth-frame frame-2${activeJourney === 1 ? " active" : ""}`}><div className="frame-bar"><span/><i>LIVE PREVIEW</i><b>02</b></div><img src={`${FRAME_CDN}/launch.webp`} alt="Real responsive website preview in Build Ezy" width="1200" height="675" loading="lazy" decoding="async"/><figcaption>Preview clearly before you publish.</figcaption></figure>
            <figure className={`depth-frame frame-3${activeJourney === 2 ? " active" : ""}`}><div className="frame-bar"><span/><i>CONNECTED COMMERCE</i><b>03</b></div><img src={`${FRAME_CDN}/sell.webp`} alt="Real ecommerce website created with Build Ezy" width="1200" height="675" loading="lazy" decoding="async"/><figcaption>Products and payments, connected.</figcaption></figure>
            <figure className={`depth-frame frame-4${activeJourney === 3 ? " active" : ""}`}><div className="frame-bar"><span/><i>GROWTH EXPERIENCE</i><b>04</b></div><img src={`${FRAME_CDN}/grow.webp`} alt="Real analytics website experience created with Build Ezy" width="1200" height="675" loading="lazy" decoding="async"/><figcaption>Turn insight into your next move.</figcaption></figure>
          </div>
          <div className="journey-progress"><i/><span>Keep scrolling</span></div>
        </div>
      </section>

      <section className="platform-section" id="platform">
        <div className="section-heading reveal"><span className="section-no">01 / THE PLATFORM</span><h2>One connected world.<br/><em>Every tool in orbit.</em></h2><p>Build Ezy brings the whole website journey into one clear system—from the first page to the first customer and every insight after.</p></div>
        <div className="orbit-stage reveal">
          <div className="orbit-line orbit-a"/><div className="orbit-line orbit-b"/>
          <div className="core"><img className="official-logo core-logo" src="/buildez-logo-dark.svg" alt="BuildEzy" /><small>YOUR DIGITAL HQ</small></div>
          <article className="orbit-card card-design"><span>01</span><i>✦</i><h3>Visual Builder</h3><p>Shape responsive pages with precise, direct controls.</p></article>
          <article className="orbit-card card-pages"><span>02</span><i>✧</i><h3>AI Agents</h3><p>Put intelligent assistants to work across your business.</p></article>
          <article className="orbit-card card-store"><span>03</span><i>◇</i><h3>CRM</h3><p>Keep leads, customers, and conversations connected.</p></article>
          <article className="orbit-card card-insights"><span>04</span><i>⌁</i><h3>Business Intelligence</h3><p>Turn live signals into clear, actionable decisions.</p></article>
          <article className="orbit-card card-domain"><span>05</span><i>◎</i><h3>Smart Commerce</h3><p>Run products, orders, and payments in one flow.</p></article>
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

      <section className="audience-section" id="for-whom">
        <div className="audience-heading reveal">
          <span className="section-no">03 / MADE FOR YOUR MOMENT</span>
          <h2>Different ambitions.<br/><em>One place to build.</em></h2>
          <p>Build Ezy adapts to the way you work—whether you are launching your first idea or managing an entire client portfolio.</p>
        </div>
        <div className="audience-grid">
          <article className="audience-card audience-agency reveal"><span className="audience-index">01</span><div className="audience-symbol"><i/><i/><i/></div><small>FOR CREATIVE TEAMS</small><h3>Agencies</h3><p>Move from client brief to polished launch in one connected workspace. Keep every brand distinct while making delivery repeatable.</p><ul><li>Multi-site workflows</li><li>Consistent design systems</li><li>Faster client launches</li></ul></article>
          <article className="audience-card audience-founder reveal"><span className="audience-index">02</span><div className="audience-symbol"><b>1</b><i/></div><small>FOR IDEA OWNERS</small><h3>Solo founders</h3><p>Turn an idea into a credible business presence without assembling a complicated stack or waiting on multiple specialists.</p><ul><li>Launch-ready foundations</li><li>Domains and analytics</li><li>Room to grow</li></ul></article>
          <article className="audience-card audience-freelance reveal"><span className="audience-index">03</span><div className="audience-symbol"><i/><b>↗</b></div><small>FOR INDEPENDENT CREATORS</small><h3>Freelancers</h3><p>Create standout work, manage client sites, and spend more time on craft instead of repetitive setup and maintenance.</p><ul><li>Visual page building</li><li>Reusable brand control</li><li>Professional publishing</li></ul></article>
          <article className="audience-card audience-business reveal"><span className="audience-index">04</span><div className="audience-symbol"><i/><i/><i/><i/></div><small>FOR GROWING OPERATORS</small><h3>Businesses</h3><p>Bring your website, products, performance, and customer journey together as your operation becomes more ambitious.</p><ul><li>Connected commerce</li><li>Live performance insight</li><li>Scalable page management</li></ul></article>
        </div>
      </section>

      <section className="difference-section" id="difference">
        <div className="difference-head reveal"><span className="section-no">04 / WHY BUILD EZY</span><h2>Less stitching.<br/><em>More momentum.</em></h2></div>
        <div className="difference-grid">
          <article className="difference-card wide reveal"><span className="card-index">01</span><div className="flow-visual"><i>Design</i><b>→</b><i>Publish</i><b>→</b><i>Grow</i></div><h3>One flow, end to end.</h3><p>No scattered handoffs or disconnected dashboards. Your pages, store, audience, domains, and performance move together.</p></article>
          <article className="difference-card reveal"><span className="card-index">02</span><div className="speed-visual"><strong>1</strong><span>workspace<br/>to run it all</span></div><h3>Fast without feeling generic.</h3><p>Move from concept to launch quickly while keeping the craft, control, and character your brand deserves.</p></article>
          <article className="difference-card reveal"><span className="card-index">03</span><div className="ownership-visual"><i/><i/><i/><b>YOU</b></div><h3>Built around your ownership.</h3><p>Your brand, customer relationships, content, and decisions remain at the center—not buried behind platform complexity.</p></article>
          <article className="difference-card wide reveal"><span className="card-index">04</span><div className="scale-visual"><i/><i/><i/><i/><i/></div><h3>Simple on day one. Serious at scale.</h3><p>Launch one polished page today, then expand into rich content, commerce, analytics, domains, and a full digital operation without rebuilding your foundation.</p></article>
        </div>
      </section>

      <section className="final-cta reveal">
        <div className="cta-rings"><i/><i/><i/><i/></div><div className="cta-core"><img src="/buildez-logo-dark.svg" alt="BuildEzy" /></div>
        <span className="section-no">YOUR NEXT CHAPTER STARTS HERE</span><h2>Build something<br/><em>people remember.</em></h2><p>Bring your website, business, and growth into one beautifully connected place.</p>
        <div className="final-actions"><a href="/app/signup" className="primary-cta">Create Your Account <Arrow/></a><a href="/app/login" className="secondary-cta">Log In to Build Ezy</a></div><small>No complicated setup. Start building in minutes.</small>
      </section>

      <MarketingFooter forceDark />
      <MarketingAnalytics />
      <CookieConsentBanner
        storageKey="buildez_cookie_consent_marketing"
        brandName="BuildEzy"
        message="BuildEzy uses cookies for essential functionality, security, and (with your consent) analytics."
        learnMoreHref="/cookies"
        learnMoreLabel="Cookie Policy"
        onConsent={(choice) => choice === "accepted" && notifyAnalyticsConsentGranted()}
      />
    </main>
  );
}
