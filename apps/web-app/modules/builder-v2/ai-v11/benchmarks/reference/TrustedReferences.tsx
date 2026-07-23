import type React from "react";
import type { V11VisualFixtureId } from "../visual/visualFixture";
import AznacParityReference from "../../fixtures/aznac-parity-single-file";

const CSS = `
.v11-ref, .v11-ref * { box-sizing:border-box } .v11-ref { margin:0; overflow:hidden; font-family:Inter,Arial,sans-serif }
.vr-section{position:relative;width:100%}.vr-wrap{width:min(1280px,100%);margin:auto}.vr-grid{display:grid}.vr-flex{display:flex}.vr-serif{font-family:Georgia,'Times New Roman',serif}.vr-img{display:block;width:100%;object-fit:cover}.vr-button{display:inline-flex;text-decoration:none;border:0;cursor:pointer}
.lux-hero{min-height:100vh;background:#0c0a09;color:#fff;overflow:hidden}.lux-bg{position:absolute;inset:0;height:100%;opacity:.7}.lux-overlay{position:absolute;inset:0;background:linear-gradient(to right,#0c0a09,rgba(12,10,9,.7),transparent)}
.lux-hero-grid{position:relative;z-index:10;min-height:100vh;grid-template-columns:repeat(12,minmax(0,1fr));align-items:center;gap:32px;padding:96px 48px}.lux-copy{grid-column:span 7;flex-direction:column;align-items:flex-start;gap:32px}.lux-eye{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.32em;color:#fcd34d}.lux-h1{font-size:96px;line-height:.96;font-weight:500;letter-spacing:-.025em;margin:0}.lux-body{max-width:672px;font-size:20px;line-height:2;color:#e7e5e4}.lux-cta{border-radius:9999px;background:#fcd34d;color:#0c0a09;padding:16px 32px;font-weight:600}.lux-float{position:absolute;right:48px;bottom:40px;z-index:20;width:384px;padding:12px;border:1px solid rgba(255,255,255,.2);border-radius:24px;background:rgba(255,255,255,.1);backdrop-filter:blur(24px);box-shadow:0 25px 50px -12px rgba(0,0,0,.25)}.lux-float img{height:224px;border-radius:16px}.lux-float-row{display:flex;justify-content:space-between;align-items:flex-end;padding:16px 12px 8px}.lux-editorial{background:#f5f5f4;color:#1c1917;padding:128px 48px}.lux-editorial-grid{grid-template-columns:repeat(12,minmax(0,1fr));gap:80px}.lux-intro{grid-column:span 4}.lux-story{grid-column:6/span 7;flex-direction:column;gap:40px}.lux-h2{font-size:60px;line-height:1.25;margin:0}.lux-story-pair{grid-template-columns:repeat(2,minmax(0,1fr));gap:32px}.lux-court{height:320px;margin-top:-64px;border-radius:9999px 9999px 0 0}.lux-stats{grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.lux-gallery{grid-template-columns:repeat(3,minmax(0,1fr));gap:32px;margin-top:96px}.lux-card{position:relative;overflow:hidden;border-radius:24px;background:#1c1917}.lux-card>img{height:320px;opacity:.8}.lux-card-copy{position:absolute;inset:auto 0 0;padding:24px;color:#fff;background:linear-gradient(to top,#0c0a09,transparent)}
.saas-hero{background:#020617;color:#fff;padding:128px 24px}.saas-grid{grid-template-columns:repeat(12,minmax(0,1fr));align-items:center;gap:64px}.saas-copy{grid-column:span 6;flex-direction:column;align-items:flex-start;gap:32px}.saas-h1{font-size:72px;line-height:1.25;margin:0}.saas-panel{grid-column:span 6;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;padding:20px;border:1px solid rgba(103,232,249,.2);border-radius:24px;background:#0f172a}.saas-panel>img{grid-column:span 2;height:320px;border-radius:16px}.saas-metric{padding:16px;border-radius:12px;background:#020617}.saas-features{padding:128px 24px;background:#fff;color:#020617}.saas-intro{grid-template-columns:repeat(2,minmax(0,1fr));gap:32px;margin-bottom:64px}.saas-cards{grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}.saas-card{padding:24px;border:1px solid rgba(103,232,249,.2);border-radius:16px;background:#0f172a;color:#fff}.saas-icon{width:40px;height:40px;margin-bottom:32px;border-radius:12px;background:#67e8f9}.saas-cta{background:#67e8f9}
@media(max-width:1024px){.lux-h1{font-size:72px}.lux-editorial{padding:96px 24px}.lux-editorial-grid{grid-template-columns:1fr;gap:48px}.lux-intro,.lux-story{grid-column:auto}.lux-gallery{margin-top:-32px}.saas-h1{font-size:72px}.saas-cards{grid-template-columns:repeat(2,1fr)}}
@media(max-width:768px){.lux-hero-grid{display:flex;flex-direction:column;justify-content:center;padding:96px 24px}.lux-copy{width:100%}.lux-h1{font-size:48px}.lux-body{font-size:18px}.lux-float{position:absolute;right:24px;bottom:40px;width:288px}.lux-float img{height:192px}.lux-editorial{padding:96px 24px}.lux-story-pair,.lux-stats,.lux-gallery{grid-template-columns:1fr}.lux-court{margin-top:0}.lux-gallery{margin-top:96px}.saas-hero{padding:96px 24px}.saas-grid{grid-template-columns:1fr}.saas-copy,.saas-panel{grid-column:auto}.saas-h1{font-size:48px}.saas-features{padding:96px 24px}.saas-intro,.saas-cards{grid-template-columns:1fr}}
`;

const CORPUS_CSS = `.corpus-hero,.corpus-second{position:relative;padding:96px 24px}.corpus-dark{background:#020617;color:#fff}.corpus-light{background:#fff;color:#020617}.corpus-amber{background:#fcd34d;color:#0c0a09}.corpus-grid{position:relative;z-index:1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:center;gap:64px}.corpus-copy{display:flex;flex-direction:column;align-items:flex-start;gap:32px}.corpus-h1{font-size:72px;line-height:1.05;margin:0}.corpus-button{padding:16px 32px;border:0;border-radius:9999px;background:#67e8f9;color:#020617}.corpus-media{height:384px;border-radius:24px;object-fit:cover}.corpus-second-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px}.corpus-card{padding:32px;border-radius:24px;background:#0f172a;color:#fff}.corpus-card img{height:192px;margin-top:24px}.editorial-architecture .corpus-grid,.creative-agency .corpus-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.editorial-architecture .corpus-copy,.creative-agency .corpus-copy{grid-column:span 2}.luxury-product-launch .corpus-hero,.creative-agency .corpus-hero,.coastal-resort .corpus-hero{min-height:100vh}.luxury-product-launch .corpus-grid,.creative-agency .corpus-grid{min-height:calc(100vh - 192px)}.coastal-resort .corpus-media{position:absolute;inset:0;width:100%;height:100%;border-radius:0;opacity:.7}.coastal-resort .corpus-grid{display:flex;min-height:calc(100vh - 192px)}.coastal-resort .corpus-copy{max-width:896px}@media(max-width:767px){.corpus-grid,.corpus-second-grid,.editorial-architecture .corpus-grid,.creative-agency .corpus-grid{grid-template-columns:1fr}.editorial-architecture .corpus-copy,.creative-agency .corpus-copy{grid-column:auto}.corpus-h1{font-size:48px}}`;
type CorpusId = Exclude<
  V11VisualFixtureId,
  "luxury-real-estate" | "modern-saas" | "aznac-parity-single-file"
>;
const CORPUS: Partial<Record<
  CorpusId,
  {
    title: string;
    eyebrow: string;
    cta: string;
    second: string;
    body: string;
    hero: string;
    editorial: string;
    tone: string;
  }
>> = {
  "editorial-architecture": {
    title: "Buildings drawn from light, weather, and place.",
    eyebrow: "Atelier North",
    cta: "View selected work",
    second: "A practice of patient observation.",
    body: "Homes, cultural spaces, and landscapes shaped through material restraint.",
    hero: "luxury-residence-courtyard",
    editorial: "residence-2",
    tone: "corpus-light",
  },
  "luxury-product-launch": {
    title: "An object of quiet precision.",
    eyebrow: "Edition No. 01",
    cta: "Reserve the edition",
    second: "Made slowly. Heard instantly.",
    body: "Machined aluminum, natural wool, and a calibrated acoustic chamber.",
    hero: "residence-1",
    editorial: "luxury-residence-detail",
    tone: "corpus-dark",
  },
  "coastal-resort": {
    title: "Days measured in tides, shade, and salt air.",
    eyebrow: "The slow coast",
    cta: "Plan your stay",
    second: "Three ways to disappear.",
    body: "Private coves, garden rooms, and open-air rituals.",
    hero: "luxury-residence-hero",
    editorial: "residence-1",
    tone: "corpus-dark",
  },
  "minimal-advisory": {
    title: "Clarity for consequential decisions.",
    eyebrow: "Hale & Partners",
    cta: "Begin a conversation",
    second: "Strategy without theatre.",
    body: "Independent advice for leaders navigating growth, transition, and complexity.",
    hero: "luxury-residence-detail",
    editorial: "residence-2",
    tone: "corpus-light",
  },
  "bento-software": {
    title: "Work flows. Context stays.",
    eyebrow: "Workflow intelligence",
    cta: "Explore Relay",
    second: "Automate handoffs. Explain every decision.",
    body: "Focused capability blocks with responsive bento rhythm.",
    hero: "saas-product-console",
    editorial: "residence-3",
    tone: "corpus-dark",
  },
  "creative-agency": {
    title: "Make the familiar impossible to ignore.",
    eyebrow: "Independent creative studio",
    cta: "Start something bold",
    second: "Identity. Campaign. Experience.",
    body: "We build loud ideas with disciplined systems and precise timing.",
    hero: "residence-2",
    editorial: "residence-1",
    tone: "corpus-amber",
  },
};

export function TrustedV11Reference({ id }: { id: V11VisualFixtureId }) {
  if (id === "aznac-parity-single-file") return <AznacParityReference />;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `${CSS}${CORPUS_CSS}` }} />
      {id === "luxury-real-estate" ? (
        <LuxuryReference />
      ) : id === "modern-saas" ? (
        <SaasReference />
      ) : (
        <CorpusReference id={id} />
      )}
    </>
  );
}

function CorpusReference({ id }: { id: CorpusId }) {
  const item = CORPUS[id];
  if (!item) return <SaasReference />;
  return (
    <main className={`v11-ref ${id}`}>
      <section className={`corpus-hero ${item.tone}`} data-visual-role="hero">
        <div className="vr-wrap corpus-grid">
          <div className="corpus-copy">
            <p>{item.eyebrow}</p>
            <h1 className="corpus-h1" data-visual-role="primary-heading">
              {item.title}
            </h1>
            <a className="corpus-button" data-visual-role="cta">
              {item.cta}
            </a>
          </div>
          <img
            className="vr-img corpus-media"
            data-visual-role="hero-media"
            src={`/v11-fixtures/${item.hero}.svg`}
            alt=""
          />
        </div>
      </section>
      <section
        className="corpus-second corpus-light"
        data-visual-role="second-section"
      >
        <div className="vr-wrap corpus-second-grid">
          <h2>{item.second}</h2>
          <p>{item.body}</p>
          <article className="corpus-card" data-visual-role="floating-card">
            <h3>{item.second}</h3>
            <img
              className="vr-img"
              data-visual-role="editorial-image"
              src={`/v11-fixtures/${item.editorial}.svg`}
              alt=""
            />
          </article>
        </div>
      </section>
    </main>
  );
}

function LuxuryReference() {
  const homes = [
    ["The Courtyard House", "Hyderabad", "residence-1"],
    ["The Glass Pavilion", "Bengaluru", "residence-2"],
    ["The Garden Rooms", "Chennai", "residence-3"],
  ];
  return (
    <main className="v11-ref" data-reference-fixture="luxury-real-estate">
      <section className="vr-section lux-hero" data-visual-role="hero">
        <img
          className="vr-img lux-bg"
          data-visual-role="hero-media"
          src="/v11-fixtures/luxury-residence-hero.svg"
          alt=""
        />
        <div className="lux-overlay" data-visual-role="hero-overlay" />
        <div className="vr-wrap vr-grid lux-hero-grid">
          <div className="vr-flex lux-copy">
            <p className="lux-eye">Private residences · South India</p>
            <h1 className="vr-serif lux-h1" data-visual-role="primary-heading">
              Architecture shaped around the art of arrival.
            </h1>
            <p className="lux-body">
              A limited collection of garden residences where quiet materiality,
              generous light, and considered landscapes create enduring homes.
            </p>
            <a href="#" className="vr-button lux-cta" data-visual-role="cta">
              Request a private viewing
            </a>
          </div>
          <div className="lux-float" data-visual-role="floating-card">
            <img
              className="vr-img"
              src="/v11-fixtures/luxury-residence-detail.svg"
              alt=""
            />
            <div className="lux-float-row">
              <div>
                <small>NOW PRESENTING</small>
                <h2 className="vr-serif">The Courtyard House</h2>
              </div>
              <span>01 / 04</span>
            </div>
          </div>
        </div>
      </section>
      <section
        className="vr-section lux-editorial"
        data-visual-role="second-section"
      >
        <div className="vr-wrap vr-grid lux-editorial-grid">
          <div className="lux-intro">A QUIETER EXPRESSION OF LUXURY</div>
          <div className="vr-flex lux-story">
            <h2 className="vr-serif lux-h2">
              Designed as a sequence of light, landscape, and privacy.
            </h2>
            <div className="vr-grid lux-story-pair">
              <p>
                Every residence is composed around planted courts and long
                views, balancing dramatic scale with intimate rooms for everyday
                rituals.
              </p>
              <img
                className="vr-img lux-court"
                data-visual-role="editorial-image"
                src="/v11-fixtures/luxury-residence-courtyard.svg"
                alt=""
              />
            </div>
            <div className="vr-grid lux-stats">
              <b>
                24
                <br />
                <small>PRIVATE RESIDENCES</small>
              </b>
              <b>
                3.8
                <br />
                <small>ACRES OF LANDSCAPE</small>
              </b>
              <b>
                2027
                <br />
                <small>EXPECTED COMPLETION</small>
              </b>
            </div>
          </div>
        </div>
        <div className="vr-wrap vr-grid lux-gallery">
          {homes.map(([name, city, img]) => (
            <article className="lux-card" key={name}>
              <img className="vr-img" src={`/v11-fixtures/${img}.svg`} alt="" />
              <div className="lux-card-copy">
                <h3 className="vr-serif">{name}</h3>
                <p>{city}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function SaasReference() {
  const cards = [
    ["Live topology", "Map every service and dependency as systems change."],
    [
      "Signal correlation",
      "Group related symptoms into one operational narrative.",
    ],
    [
      "Guided resolution",
      "Move from alert to verified repair with shared context.",
    ],
    [
      "Release intelligence",
      "Connect customer impact to the change that introduced it.",
    ],
  ];
  return (
    <main className="v11-ref" data-reference-fixture="modern-saas">
      <section className="vr-section saas-hero" data-visual-role="hero">
        <div className="vr-wrap vr-grid saas-grid">
          <div className="vr-flex saas-copy">
            <p className="lux-eye">Operational intelligence</p>
            <h1 className="saas-h1" data-visual-role="primary-heading">
              See every system. Resolve what matters.
            </h1>
            <p className="lux-body">
              A shared command layer that turns fragmented telemetry into clear,
              collaborative decisions.
            </p>
            <a
              className="vr-button lux-cta saas-cta"
              data-visual-role="cta"
              href="#"
            >
              Start exploring
            </a>
          </div>
          <div className="vr-grid saas-panel" data-visual-role="floating-card">
            <img
              className="vr-img"
              data-visual-role="hero-media"
              src="/v11-fixtures/saas-product-console.svg"
              alt=""
            />
            <div className="saas-metric">
              <b>42%</b>
              <p>Faster resolution</p>
            </div>
            <div className="saas-metric">
              <b>8.4k</b>
              <p>Signals correlated</p>
            </div>
          </div>
        </div>
      </section>
      <section
        className="vr-section saas-features"
        data-visual-role="second-section"
      >
        <div className="vr-wrap">
          <div className="vr-grid saas-intro">
            <h2>A technical workspace built around decisions.</h2>
            <p>
              Structured capability blocks keep the product legible without
              repeating the cinematic composition of the real-estate fixture.
            </p>
          </div>
          <div className="vr-grid saas-cards">
            {cards.map(([title, body]) => (
              <article className="saas-card" key={title}>
                <div className="saas-icon" />
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
