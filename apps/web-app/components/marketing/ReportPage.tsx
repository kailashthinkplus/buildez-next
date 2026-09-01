"use client";

import { useState } from "react";
import { Bug, ShieldAlert, ListChecks, Lock, Clock, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { MarketingFooter } from "./MarketingFooter";
import { MarketingHeader } from "./MarketingHeader";
import { ContactModal } from "./ContactModal";

type ReportType = "BUG" | "ABUSE";

const COPY: Record<ReportType, {
  badge: string; title: string; subtitle: string; ctaLabel: string; icon: LucideIcon;
  cards: Array<{ icon: LucideIcon; title: string; body: string }>;
  notice?: { title: string; body: string };
}> = {
  BUG: {
    badge: "Report a bug",
    title: "Help us fix what's broken.",
    subtitle: "The clearer the report, the faster we can reproduce and resolve it. A few specifics go a long way.",
    ctaLabel: "Submit a bug report",
    icon: Bug,
    cards: [
      { icon: ListChecks, title: "Exact steps to reproduce", body: "What page or feature, what you clicked or typed, and what happened instead of what you expected." },
      { icon: Clock, title: "When it happened", body: "The approximate time helps us cross-reference logs. Note whether it happens every time or only sometimes." },
      { icon: Lock, title: "Keep it safe", body: "Never include passwords, one-time codes, full payment details, or private API keys — a screenshot with those redacted is fine." },
    ],
  },
  ABUSE: {
    badge: "Report abuse",
    title: "Report harmful or unlawful use.",
    subtitle: "Use this if you believe a BuildEzy-hosted website or account is being used for phishing, fraud, harassment, or another violation of our Terms.",
    ctaLabel: "Submit an abuse report",
    icon: ShieldAlert,
    cards: [
      { icon: ListChecks, title: "The exact URL", body: "The specific BuildEzy site or page involved, not just the domain — this is the single most useful detail." },
      { icon: ShieldAlert, title: "Why it's a violation", body: "A short description of the content or conduct and why it's abusive, deceptive, or unlawful." },
      { icon: Lock, title: "Only what you're authorized to share", body: "Submit context you're allowed to share; we may follow up for more if needed to review the report." },
    ],
    notice: { title: "If anyone is in immediate danger", body: "Contact local emergency services or law enforcement first. BuildEzy is not an emergency response service, and reports here are reviewed on a standard timeline." },
  },
};

export function ReportPage({ type }: { type: ReportType }) {
  const copy = COPY[type];
  const Icon = copy.icon;
  const [open, setOpen] = useState(false);

  return (
    <div className="report-page-shell">
      <MarketingHeader />
      <main className="report-page-main">
        <header className="report-page-hero">
          <span className="report-page-badge"><Icon size={14} aria-hidden="true" />{copy.badge}</span>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
          <button type="button" className="report-page-cta" onClick={() => setOpen(true)}>{copy.ctaLabel}<ArrowRight size={16} aria-hidden="true" /></button>
        </header>

        {copy.notice ? (
          <div className="report-page-notice">
            <strong>{copy.notice.title}</strong>
            <p>{copy.notice.body}</p>
          </div>
        ) : null}

        <div className="report-page-cards">
          {copy.cards.map((card) => {
            const CardIcon = card.icon;
            return (
              <div className="report-page-card" key={card.title}>
                <CardIcon size={20} aria-hidden="true" />
                <h2>{card.title}</h2>
                <p>{card.body}</p>
              </div>
            );
          })}
        </div>
      </main>
      <MarketingFooter />
      <ContactModal type={type} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
