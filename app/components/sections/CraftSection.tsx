"use client";

export default function CraftSection() {
  return (
    <section className="craft-section" id="workflow">
      <div className="craft-scene reveal">
        <div className="craft-card craft-back">
          <div className="fake-header">
            <i />
            <span />
            <b />
          </div>
          <div className="fake-grid">
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="craft-card craft-front">
          <span className="selection-tag">Live canvas</span>
          <div className="portfolio-copy">
            <small>NEW COLLECTION</small>
            <strong>
              Objects for
              <br />
              quiet living.
            </strong>
            <button>Discover the edit</button>
          </div>
          <div className="product-shape">
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="tool-pill tool-one">↔ Responsive by default</div>
        <div className="tool-pill tool-two">✓ Ready to publish</div>
      </div>
      <div className="craft-copy reveal">
        <span className="section-no">02 / FROM IDEA TO LIVE</span>
        <h2>
          Make it yours.
          <br />
          <em>See it instantly.</em>
        </h2>
        <p>
          Start with a blank canvas or a proven foundation, then refine every detail in context.
          Layout, type, color, media, motion, and mobile behavior stay close at hand.
        </p>
        <ul>
          <li>
            <b>01</b>
            <span>
              <strong>Build visually</strong>Work directly on the page you&rsquo;re creating.
            </span>
          </li>
          <li>
            <b>02</b>
            <span>
              <strong>Stay on brand</strong>Keep colors, type, and components consistent everywhere.
            </span>
          </li>
          <li>
            <b>03</b>
            <span>
              <strong>Go live cleanly</strong>Preview every breakpoint, connect a domain, and
              publish.
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
