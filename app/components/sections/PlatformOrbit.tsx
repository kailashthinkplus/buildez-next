"use client";

export default function PlatformOrbit() {
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
          Build Ezy brings the whole website journey into one clear system—from the first page to
          the first customer and every insight after.
        </p>
      </div>
      <div className="orbit-stage reveal">
        <div className="orbit-line orbit-a" />
        <div className="orbit-line orbit-b" />
        <div className="core">
          <img className="official-logo core-logo" src="/buildez-logo-dark.svg" alt="Build Ezy" />
          <small>YOUR DIGITAL HQ</small>
        </div>
        <article className="orbit-card card-design">
          <span>01</span>
          <i>✦</i>
          <h3>Visual Builder</h3>
          <p>Shape responsive pages with precise, direct controls.</p>
        </article>
        <article className="orbit-card card-pages">
          <span>02</span>
          <i>▤</i>
          <h3>Pages &amp; Content</h3>
          <p>Organize every story, campaign, and destination.</p>
        </article>
        <article className="orbit-card card-store">
          <span>03</span>
          <i>◇</i>
          <h3>Commerce</h3>
          <p>Products, secure checkout, orders, and payments.</p>
        </article>
        <article className="orbit-card card-insights">
          <span>04</span>
          <i>⌁</i>
          <h3>Live Insights</h3>
          <p>See what people visit, click, and care about.</p>
        </article>
        <article className="orbit-card card-domain">
          <span>05</span>
          <i>◎</i>
          <h3>Domains &amp; Launch</h3>
          <p>Connect your address and publish with confidence.</p>
        </article>
      </div>
    </section>
  );
}
