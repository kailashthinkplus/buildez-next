"use client";

import { MagneticButton } from "../motion/primitives";

const Arrow = () => <span aria-hidden="true">↗</span>;

export default function SiteHeader() {
  return (
    <nav className="topbar" aria-label="Main navigation">
      <a href="#top" className="brand" aria-label="Build Ezy home">
        <img className="official-logo" src="/buildez-logo-dark.svg" alt="Build Ezy" />
      </a>
      <div className="nav-links">
        <a href="#platform">Platform</a>
        <a href="#difference">Why Build Ezy</a>
        <a href="#workflow">How it works</a>
      </div>
      <div className="nav-actions">
        <a href="/app/login" className="login-link">
          Log In
        </a>
        <MagneticButton href="/app/onboarding" className="mini-cta" strength={3}>
          Start Building <Arrow />
        </MagneticButton>
      </div>
    </nav>
  );
}
