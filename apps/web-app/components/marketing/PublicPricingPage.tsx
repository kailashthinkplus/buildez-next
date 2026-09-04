"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { MarketingFooter } from "./MarketingFooter";
import { MarketingHeader } from "./MarketingHeader";
import { useDisplayCurrency } from "@/lib/useDisplayCurrency";
import CurrencySwitcher from "@/components/billing/CurrencySwitcher";

type BillingCycle = "monthly" | "yearly";

type PublicPlan = {
  code: string;
  name: string;
  description: string;
  maxSites: number;
  maxPages: number;
  aiCredits: number;
  teamMembers: number;
  priceMonthly: number | null;
  priceYearly: number | null;
  currency: string;
  isCustom: boolean;
  features: string[];
};

export function PublicPricingPage() {
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currency: displayCurrency, setCurrency, availableCurrencies, priceFor } = useDisplayCurrency();

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/plans?active=true&public=true", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json().catch(() => []);
        if (!response.ok) throw new Error(payload?.error || "Plans could not be loaded.");
        setPlans(Array.isArray(payload) ? payload : []);
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Plans could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const hasYearly = useMemo(() => plans.some((plan) => plan.priceYearly !== null), [plans]);
  const trackRef = useRef<HTMLElement>(null);
  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".public-plan-card");
    const step = (card?.offsetWidth ?? track.clientWidth * 0.85) + 20;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <div className="marketing-info-shell pricing-page-shell">
      <MarketingHeader />
      <main className="public-pricing-main">
        <header className="public-pricing-hero">
          <div>
            <span>PLANS THAT GROW WITH THE WORK</span>
            <h1>Build now.<br /><em>Scale cleanly.</em></h1>
          </div>
          <div className="public-pricing-intro">
            <p>Every public plan below is loaded live from the BuildEzy plan catalogue managed by Super Admin. Limits, features, and prices update here when the catalogue changes.</p>
            <div className="pricing-cycle" aria-label="Billing cycle">
              <button className={billing === "monthly" ? "active" : ""} onClick={() => setBilling("monthly")}>Monthly</button>
              <button disabled={!hasYearly} className={billing === "yearly" ? "active" : ""} onClick={() => setBilling("yearly")}>Yearly</button>
            </div>
            <CurrencySwitcher symbolOnly stacked currency={displayCurrency} currencies={availableCurrencies} onChange={setCurrency} />
            {displayCurrency !== "INR" ? (
              <p className="pricing-currency-note">
                Showing estimated prices in {displayCurrency}, converted from INR at today's rate.
                Your exact price and billing currency are confirmed at checkout.
              </p>
            ) : null}
          </div>
        </header>

        {loading ? <div className="pricing-state">Loading current plans…</div> : null}
        {error ? <div className="pricing-state pricing-error">{error} Please refresh or open Plans after signing in.</div> : null}
        {!loading && !error && plans.length === 0 ? <div className="pricing-state">No public plans are available right now.</div> : null}

        <div className="public-pricing-carousel">
          {plans.length > 1 ? (
            <div className="pricing-carousel-nav">
              <button type="button" aria-label="Scroll to previous plan" onClick={() => scrollByCard(-1)}>←</button>
              <button type="button" aria-label="Scroll to next plan" onClick={() => scrollByCard(1)}>→</button>
            </div>
          ) : null}
          <section className="public-pricing-grid" aria-label="BuildEzy plans" ref={trackRef}>
          {plans.map((plan, index) => {
            const amount = billing === "monthly" ? plan.priceMonthly : plan.priceYearly;
            const unavailable = !plan.isCustom && amount === null;
            const featured = plan.code.toUpperCase() === "PRO" || (plans.length > 2 && index === 2);
            return (
              <article key={plan.code} className={`public-plan-card${featured ? " featured" : ""}`}>
                <div className="plan-card-top">
                  <span>{String(index + 1).padStart(2, "0")} / {plan.code}</span>
                  {featured ? <b>Most popular</b> : null}
                </div>
                <h2>{plan.name}</h2>
                <p>{plan.description}</p>
                <div className="plan-price">
                  {plan.isCustom ? <strong>Let&apos;s talk</strong> : unavailable ? <strong>Unavailable</strong> : <><strong>{priceFor(amount ?? 0, plan.currency)}</strong><span>/{billing === "monthly" ? "month" : "year"}</span></>}
                </div>
                {!plan.isCustom && (amount ?? 0) > 0 ? <small>Final total is shown before checkout.</small> : <small>{plan.isCustom ? "Commercial terms are tailored to your organisation." : "No subscription charge."}</small>}
                <ul>
                  <li>{plan.maxSites.toLocaleString()} website{plan.maxSites === 1 ? "" : "s"}</li>
                  <li>{plan.maxPages.toLocaleString()} pages</li>
                  <li>{plan.aiCredits.toLocaleString()} AI credits</li>
                  <li>{plan.teamMembers.toLocaleString()} team member{plan.teamMembers === 1 ? "" : "s"}</li>
                  {plan.features.slice(0, 5).map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
                <Link className="plan-cta" href={plan.isCustom ? "/faq" : `/app/signup?plan=${encodeURIComponent(plan.code)}`}>
                  {plan.isCustom ? "Contact enterprise" : amount === 0 ? "Start free" : unavailable ? "Join BuildEzy" : `Choose ${plan.name}`}
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            );
          })}
          </section>
        </div>

        <section className="pricing-assurance">
          <div><span>01</span><h3>Live catalogue</h3><p>Plans, limits, prices and feature lists come directly from the same catalogue used in the authenticated workspace.</p></div>
          <div><span>02</span><h3>Clear checkout</h3><p>The final payable amount is presented before payment. Checkout availability can vary by plan and cycle.</p></div>
          <div><span>03</span><h3>Room to change</h3><p>Manage upgrades, renewals, invoices, subscription status and eligible cancellations from Billing after signing in.</p></div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
