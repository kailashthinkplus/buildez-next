"use client";

import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, CreditCard, Sparkles, Globe, ShoppingBag, AlertCircle, LayoutGrid, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { MarketingFooter } from "./MarketingFooter";
import { MarketingHeader } from "./MarketingHeader";
import { ContactModal } from "./ContactModal";
import { helpCategories, type HelpCategoryId } from "./helpCenterData";

const ICONS: Record<string, LucideIcon> = { BookOpen, CreditCard, Sparkles, Globe, ShoppingBag, AlertCircle };

export function HelpCenter() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<HelpCategoryId | "all">("all");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  const totalCount = useMemo(() => helpCategories.reduce((sum, cat) => sum + cat.items.length, 0), []);

  const visibleCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return helpCategories
      .filter((cat) => active === "all" || cat.id === active)
      .map((cat) => ({ ...cat, items: q ? cat.items.filter((item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)) : cat.items }))
      .filter((cat) => cat.items.length > 0);
  }, [query, active]);

  return (
    <div className="help-center-shell">
      <MarketingHeader />
      <main className="help-center-main">
        <header className="help-center-hero">
          <span className="help-center-badge">Help Center</span>
          <h1>How can we help?</h1>
          <p>Find answers to common questions about BuildEzy — from getting started to billing, publishing, and commerce.</p>
          <div className="help-center-search">
            <Search size={17} aria-hidden="true" />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions, topics, keywords…" aria-label="Search the help center" />
          </div>
        </header>

        <div className="help-center-categories">
          <button type="button" className={active === "all" ? "active" : ""} onClick={() => setActive("all")}>
            <LayoutGrid size={18} aria-hidden="true" />
            <span>All Topics</span>
            <small>{totalCount} articles</small>
          </button>
          {helpCategories.map((cat) => {
            const Icon = ICONS[cat.icon] || LayoutGrid;
            return (
              <button type="button" key={cat.id} className={active === cat.id ? "active" : ""} onClick={() => setActive(cat.id)}>
                <Icon size={18} aria-hidden="true" />
                <span>{cat.label}</span>
                <small>{cat.items.length} articles</small>
              </button>
            );
          })}
        </div>

        {visibleCategories.length === 0 ? (
          <p className="help-center-empty">No results for “{query}”. Try a different search, or <button type="button" onClick={() => setContactOpen(true)}>contact support</button>.</p>
        ) : (
          visibleCategories.map((cat) => {
            const Icon = ICONS[cat.icon] || LayoutGrid;
            return (
              <section key={cat.id} className="help-center-group">
                <div className="help-center-group-head">
                  <Icon size={18} aria-hidden="true" />
                  <h2>{cat.label}</h2>
                  <span>{cat.items.length}</span>
                </div>
                <div className="help-center-list">
                  {cat.items.map((item) => {
                    const key = `${cat.id}:${item.q}`;
                    const open = openKey === key;
                    return (
                      <div className={`help-center-row${open ? " open" : ""}`} key={key}>
                        <button type="button" onClick={() => setOpenKey(open ? null : key)} aria-expanded={open}>
                          <span>{item.q}</span>
                          <i aria-hidden="true">{open ? "−" : "+"}</i>
                        </button>
                        {open ? <p>{item.a}</p> : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}

        <section className="help-center-cta">
          <div><h2>Still need a hand?</h2><p>Send us the details and we&apos;ll get back to you.</p></div>
          <button type="button" onClick={() => setContactOpen(true)}>Contact support<ArrowRight size={16} aria-hidden="true" /></button>
        </section>
      </main>
      <MarketingFooter />
      <ContactModal type="SUPPORT" open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
