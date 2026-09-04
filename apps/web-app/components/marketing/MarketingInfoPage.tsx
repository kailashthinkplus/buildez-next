import Link from "next/link";

import { MarketingFooter } from "./MarketingFooter";
import { MarketingHeader } from "./MarketingHeader";
import { marketingPages, type MarketingPageKey, type MarketingPageContent } from "./marketingPages";

export function MarketingInfoPage({ page, contentOverride }: { page: MarketingPageKey; contentOverride?: MarketingPageContent }) {
  const content = contentOverride ?? marketingPages[page];
  const legalPages: MarketingPageKey[] = ["privacy", "terms", "refunds", "cookies", "dpa"];
  const isLegal = legalPages.includes(page);

  const sections = (
    <div className="marketing-info-box">
      {content.sections.map((section, index) => (
        <section key={section.title} id={`section-${index + 1}`} className="marketing-info-section">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets ? <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
          </div>
        </section>
      ))}
    </div>
  );

  return (
    <div className={`marketing-info-shell marketing-layout-${page}`}>
      <MarketingHeader />
      <main className="marketing-info-main">
        <header className="marketing-info-hero">
          <span>{content.eyebrow}</span>
          <h1>{content.title}</h1>
          <p>{content.intro}</p>
          {content.updated ? <small>{content.updated}</small> : null}
        </header>
        {isLegal ? (
          <div className="legal-document-grid">
            <aside aria-label={`${content.title} contents`}>
              <strong>On this page</strong>
              {content.sections.map((section, index) => <a key={section.title} href={`#section-${index + 1}`}>{section.title}</a>)}
            </aside>
            {sections}
          </div>
        ) : sections}
        {content.cta ? (
          <section className="marketing-info-cta">
            <div><h2>Ready for the next step?</h2><p>{content.cta.note}</p></div>
            <Link href={content.cta.href}>{content.cta.label}<span aria-hidden="true">→</span></Link>
          </section>
        ) : null}
      </main>
      <MarketingFooter />
    </div>
  );
}
