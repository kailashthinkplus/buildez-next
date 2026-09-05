"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, CreditCard, Loader2, Sparkles } from "lucide-react";

import EnterpriseContactModal from "@/components/billing/EnterpriseContactModal";
import CurrencySwitcher from "@/components/billing/CurrencySwitcher";
import PlanComparisonModal from "@/components/billing/PlanComparisonModal";
import { useDisplayCurrency } from "@/lib/useDisplayCurrency";
import { formatPlanCodeLabel } from "@/lib/billing/formatPlanLabel";

const VISIBLE_FEATURE_COUNT = 5;

type BillingCycle = "monthly" | "yearly";

type Plan = {
  code: string;
  name: string;
  description: string;
  eyebrow?: string | null;
  isTrial?: boolean;
  trialDays?: number | null;
  maxSites: number;
  maxPages: number;
  aiCredits: number;
  teamMembers: number;
  priceMonthly: number | null;
  priceYearly: number | null;
  currency: string;
  isCustom: boolean;
  popular?: boolean;
  checkoutEnabled: Record<BillingCycle, boolean>;
  features: string[];
  featureTable: Array<{ key: string; label: string; value: string; included: boolean; priority: number }>;
};

type CurrentSubscription = {
  planCode?: string;
  status?: string;
  billingCycle?: string;
  currentPeriodEnd?: string;
};

export default function PlansPage() {
  const { currency: displayCurrency, setCurrency, availableCurrencies, priceFor } = useDisplayCurrency();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [enterpriseOpen, setEnterpriseOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get("checkout");
    const planChange = new URLSearchParams(window.location.search).get("planChange");
    let cancelled = false;

    async function loadCurrentSubscription() {
      const response = await fetch("/api/billing/current", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (response.ok && !cancelled) setCurrentSubscription(payload.subscription || null);
      return payload.subscription as CurrentSubscription | null;
    }

    async function initialize() {
      try {
        const response = await fetch("/api/plans?active=true&public=true", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Plans could not be loaded.");
        if (!cancelled) setPlans(Array.isArray(payload) ? payload : []);
        await loadCurrentSubscription();
        if (!cancelled) setLoading(false);

        if (result === "cancelled") {
          if (!cancelled) setNotice("Checkout was cancelled. No plan change was made.");
          sessionStorage.removeItem("pending-plan-code");
          history.replaceState(null, "", "/app/plans");
          return;
        }

        if (result !== "success" && planChange !== "processing") return;
        const expectedPlan = sessionStorage.getItem("pending-plan-code");
        if (!expectedPlan) {
          if (!cancelled) setNotice("Payment received. Your subscription will be updated shortly.");
          return;
        }

        if (!cancelled) setNotice("Payment received. Activating your plan…");
        for (let attempt = 0; attempt < 15 && !cancelled; attempt += 1) {
          const confirmation = await fetch("/api/billing/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planCode: expectedPlan }),
          });
          const confirmationPayload = await confirmation.json().catch(() => ({}));
          if (confirmation.ok && confirmationPayload.activated) {
            const subscription = await loadCurrentSubscription();
            if (!cancelled && subscription?.planCode?.toUpperCase() === expectedPlan.toUpperCase()) {
              const activatedPlan = (Array.isArray(payload) ? payload : []).find((plan: Plan) => plan.code.toUpperCase() === expectedPlan.toUpperCase());
              setNotice(`${activatedPlan?.name || expectedPlan} is now active.`);
              sessionStorage.removeItem("pending-plan-code");
              history.replaceState(null, "", "/app/plans");
              return;
            }
          }
          await new Promise((resolve) => window.setTimeout(resolve, 1500));
        }
        if (!cancelled) setNotice("Payment received. Activation is still processing and will update automatically.");
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Plans could not be loaded.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void initialize();
    return () => { cancelled = true; };
  }, []);

  const hasYearly = useMemo(() => plans.some((plan) => plan.priceYearly !== null), [plans]);

  function moveCarousel(direction: -1 | 1) {
    carouselRef.current?.scrollBy({
      left: direction * carouselRef.current.clientWidth,
      behavior: "smooth",
    });
  }

  async function checkout(plan: Plan) {
    setBusy(plan.code);
    setError("");
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode: plan.code, billingCycle: billing, returnPath: "/app/plans", currency: displayCurrency }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.checkoutUrl) throw new Error(payload.error || "Checkout could not be started.");
      sessionStorage.setItem("pending-plan-code", plan.code);
      window.location.assign(payload.checkoutUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Checkout could not be started.");
      setBusy("");
    }
  }

  return (
    <div className="mx-auto max-w-7xl pb-12">
      <EnterpriseContactModal open={enterpriseOpen} onClose={() => setEnterpriseOpen(false)} />
      <PlanComparisonModal
        open={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
        plans={plans}
        billing={billing}
        selectedCode={currentSubscription?.planCode ?? null}
        priceFor={priceFor}
        onSelect={(planCode) => {
          const plan = plans.find((candidate) => candidate.code === planCode);
          if (!plan) return;
          if (plan.isCustom) setEnterpriseOpen(true);
          else void checkout(plan);
        }}
      />
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] dashboard-faint">
            <CreditCard size={15} /> Plans & payments
          </div>
          <h1 className="text-3xl font-semibold tracking-[-.035em]">Choose a BuildEZ plan</h1>
          <p className="mt-2 max-w-2xl text-sm dashboard-muted">Choose the plan that fits your workspace.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/app/workspace/billing" className="dashboard-card rounded-xl px-4 py-2.5 text-sm font-semibold">Billing overview</Link>
        </div>
      </div>

      {notice && <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-700 dark:text-blue-200">{notice}</div>}
      {error && <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">{error}</div>}

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="hidden gap-2 sm:flex">
          <button onClick={() => moveCarousel(-1)} aria-label="Previous plans" className="dashboard-card grid h-10 w-10 place-items-center rounded-xl"><ChevronLeft size={18} /></button>
          <button onClick={() => moveCarousel(1)} aria-label="Next plans" className="dashboard-card grid h-10 w-10 place-items-center rounded-xl"><ChevronRight size={18} /></button>
        </div>
        <div className="flex items-center gap-3">
          <CurrencySwitcher currency={displayCurrency} currencies={availableCurrencies} onChange={setCurrency} />
          <div className="dashboard-card inline-flex rounded-xl p-1">
            {(["monthly", "yearly"] as BillingCycle[]).map((cycle) => (
              <button
                key={cycle}
                disabled={cycle === "yearly" && !hasYearly}
                onClick={() => setBilling(cycle)}
                className={`rounded-lg px-5 py-2 text-sm font-semibold capitalize transition disabled:opacity-35 ${billing === cycle ? "bg-blue-600 text-white" : "dashboard-muted"}`}
              >
                {cycle}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-10 flex h-52 items-center justify-center"><Loader2 className="animate-spin dashboard-muted" /></div>
      ) : plans.length === 0 ? (
        <div className="dashboard-card mt-8 rounded-3xl p-10 text-center dashboard-muted">No public plans are available yet.</div>
      ) : (
        <div ref={carouselRef} className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {plans.map((plan) => {
            const amount = billing === "monthly" ? plan.priceMonthly : plan.priceYearly;
            const isFree = amount === 0;
            const checkoutEnabled = plan.checkoutEnabled[billing];
            const isCurrent = (currentSubscription?.planCode || "FREE").toUpperCase() === plan.code.toUpperCase();
            const curatedStats = plan.isCustom
              ? ["Custom website limits", "Custom page limits", "Flexible AI credits", "Dedicated support"]
              : [`${plan.maxSites} website${plan.maxSites === 1 ? "" : "s"}`, `${plan.maxPages.toLocaleString()} pages`, `${plan.aiCredits.toLocaleString()} AI credits`, `${plan.teamMembers} team member${plan.teamMembers === 1 ? "" : "s"}`];
            const visibleFeatures = [...curatedStats, ...plan.features].slice(0, VISIBLE_FEATURE_COUNT);
            const hiddenFeatureCount = curatedStats.length + plan.features.length - visibleFeatures.length;
            return (
              <article
                key={plan.code}
                style={isFree ? { background: "linear-gradient(145deg, rgba(59, 130, 246, 0.16), rgba(14, 165, 233, 0.05))" } : plan.popular ? { background: "linear-gradient(145deg, rgba(99, 102, 241, 0.14), rgba(168, 85, 247, 0.05))" } : undefined}
                className={`dashboard-card relative flex min-w-full snap-start rounded-3xl p-6 md:min-w-[calc((100%_-_1.25rem)/2)] xl:min-w-[calc((100%_-_2.5rem)/3)] ${isCurrent ? "ring-2 ring-emerald-500/50" : plan.popular ? "ring-2 ring-indigo-500/40" : ""}`}
              >
                {plan.popular && !isCurrent ? (
                  <span className="absolute right-6 top-6 flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                    <Sparkles size={10} /> Most popular
                  </span>
                ) : null}
                <div className="flex w-full flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[.13em] text-blue-600 dark:text-blue-300">{plan.eyebrow || formatPlanCodeLabel(plan.code)}</p>
                    {isCurrent && <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">Active plan</span>}
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold">{plan.name}</h2>
                  <p className="mt-2 min-h-10 text-sm dashboard-muted">{plan.description}</p>
                  <div className="mt-5 text-3xl font-semibold">
                    {plan.isCustom ? "Custom" : amount === null ? "Not offered" : priceFor(amount, plan.currency)}
                    {!plan.isCustom && amount !== null && <span className="ml-1 text-sm font-normal dashboard-muted">/{billing === "monthly" ? "month" : "year"}</span>}
                  </div>
                  <ul className="mt-6 space-y-2 text-sm dashboard-muted">
                    {visibleFeatures.map((feature) => (
                      <li key={feature} className="flex items-start gap-2"><Check size={15} className="mt-0.5 shrink-0 text-emerald-500" /><span className="min-w-0 break-words">{feature}</span></li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => setComparisonOpen(true)} className="mt-2 text-left text-xs font-semibold text-blue-600 hover:underline dark:text-blue-300">
                    {hiddenFeatureCount > 0 ? `+${hiddenFeatureCount} more · compare all plans` : "Compare all plans"}
                  </button>
                  <div className="mt-auto pt-7">
                    <button
                      disabled={!plan.isCustom && (busy !== "" || amount === null || isFree || !checkoutEnabled || isCurrent)}
                      onClick={() => plan.isCustom ? setEnterpriseOpen(true) : void checkout(plan)}
                      className="dashboard-primary-button flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {busy === plan.code && <Loader2 size={15} className="animate-spin" />}
                      {plan.isCustom ? "Contact us" : isCurrent ? "Current plan" : isFree ? "Free plan" : amount === null ? "Cycle unavailable" : !checkoutEnabled ? "Currently unavailable" : busy === plan.code ? "Opening checkout…" : "Choose plan"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
