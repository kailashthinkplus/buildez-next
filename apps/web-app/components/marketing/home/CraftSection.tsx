import { OptimizedR2Image } from "./OptimizedR2Image";
import { Check, MoveHorizontal } from "lucide-react";

const CRAFT_IMAGE = "https://assets.getbuildez.com/marketing/homepage/craft/live-preview";
const CRAFT_FRONT_IMAGE = "https://assets.getbuildez.com/marketing/homepage/craft/front-canvas";

export function CraftSection() {
  return (
    <section className="craft-section" id="workflow">
      <div className="craft-scene reveal">
        <div className="craft-card craft-back">
          <div className="fake-header">
            <i />
            <span />
            <b />
          </div>
          <OptimizedR2Image
            className="fake-grid-image"
            basePath={CRAFT_IMAGE}
            alt="Customizing a website's design live in the Build Ezy builder"
          />
        </div>
        <div className="craft-card craft-front">
          <OptimizedR2Image
            className="craft-front-image"
            basePath={CRAFT_FRONT_IMAGE}
            alt="A designer editing a live website with the Build Ezy visual builder"
            width={1200}
            height={855}
          />
          <div className="tool-pill tool-two"><Check size={13} aria-hidden="true" />Ready to publish</div>
        </div>
        <div className="tool-pill tool-one"><MoveHorizontal size={13} aria-hidden="true" />Responsive by default</div>
      </div>
      <div className="craft-copy reveal">
        <span className="section-no">02 / FROM IDEA TO LIVE</span>
        <h2>
          Make it yours.
          <br />
          <em>See it instantly.</em>
        </h2>
        <p>
          Start with a blank canvas or a proven foundation, then refine every detail in context. Layout,
          type, color, media, motion, and mobile behavior stay close at hand.
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
              <strong>Go live cleanly</strong>Preview every breakpoint, connect a domain, and publish.
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
