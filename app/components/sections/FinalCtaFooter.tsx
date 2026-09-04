"use client";

import { MagneticButton } from "../motion/primitives";

const Arrow = () => <span aria-hidden="true">↗</span>;

export default function FinalCtaFooter() {
  return (
    <>
      <section className="final-cta reveal">
        <div className="cta-rings">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="cta-core">
          <img src="/buildez-logo-dark.svg" alt="Build Ezy" />
        </div>
        <span className="section-no">YOUR NEXT CHAPTER STARTS HERE</span>
        <h2>
          Build something
          <br />
          <em>people remember.</em>
        </h2>
        <p>Bring your website, business, and growth into one beautifully connected place.</p>
        <div className="final-actions">
          <MagneticButton href="/app/onboarding" className="primary-cta" strength={4}>
            Create Your Account <Arrow />
          </MagneticButton>
          <MagneticButton href="/app/login" className="secondary-cta" strength={3}>
            Log In to Build Ezy
          </MagneticButton>
        </div>
        <small>No complicated setup. Start building in minutes.</small>
      </section>

      <footer>
        <a href="#top" className="brand">
          <img className="official-logo" src="/buildez-logo-dark.svg" alt="Build Ezy" />
        </a>
        <p>Design. Launch. Sell. Grow.</p>
        <div>
          <a href="#platform">Platform</a>
          <a href="#difference">Why Build Ezy</a>
          <a href="/app/login">Log In</a>
        </div>
        <span>© 2026 Build Ezy</span>
      </footer>
    </>
  );
}
