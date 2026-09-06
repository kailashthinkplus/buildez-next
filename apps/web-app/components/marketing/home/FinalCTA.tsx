"use client";

import { MagneticButton } from "@/components/motion/primitives";
import { logMarketingCtaClick } from "@/modules/legal/MarketingAnalytics";
import { Arrow } from "./Arrow";

export function FinalCTA() {
  return (
    <section className="final-cta reveal">
      <div className="cta-rings">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="cta-core">
        <img src="/buildez-logo-dark.svg" alt="BuildEzy" />
      </div>
      <span className="section-no">YOUR NEXT CHAPTER STARTS HERE</span>
      <h2>
        Build something
        <br />
        <em>people remember.</em>
      </h2>
      <p>Bring your website, business, and growth into one beautifully connected place.</p>
      <div className="final-actions">
        <MagneticButton href="/app/signup" className="primary-cta" strength={4} onClick={() => logMarketingCtaClick("final_cta_signup")}>
          Create Your Account <Arrow />
        </MagneticButton>
        <MagneticButton href="/app/login" className="secondary-cta" strength={3} onClick={() => logMarketingCtaClick("final_cta_login")}>
          Log In to Build Ezy
        </MagneticButton>
      </div>
      <small>No complicated setup. Start building in minutes.</small>
    </section>
  );
}
