"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, CreditCard } from "lucide-react";

import PayNowModal from "./PayNowModal";
import EnterpriseContactModal from "@/components/billing/EnterpriseContactModal";
import CurrencySwitcher from "@/components/billing/CurrencySwitcher";
import { useDisplayCurrency } from "@/lib/useDisplayCurrency";
import { useOnboarding } from "../OnboardingContext";

type Plan = {
  code: string;
  name: string;
  description: string;
  tag?: string | null;
  priceMonthly?: number | null;
  priceYearly?: number | null;
  currency: string;
  checkoutEnabled: Record<"monthly" | "yearly", boolean>;
  isCustom: boolean;
  features: string[];
};

export default function StepChoosePlan({
  onNext,
  onBack,
}: {
  onNext: (data?: unknown) => void;
  onBack: () => void;
}) {
  const { planId: savedPlanId, billing: savedBilling, setPlanId, setBilling: setSavedBilling } = useOnboarding();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selected, setSelected] = useState<string | null>(savedPlanId);
  const [billing, setBilling] = useState<"monthly" | "yearly">(savedBilling === "yearly" ? "yearly" : "monthly");
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(0);
  const { currency: displayCurrency, setCurrency, availableCurrencies, priceFor } = useDisplayCurrency();

  const [showPayNow, setShowPayNow] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [enterpriseOpen, setEnterpriseOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const onNextRef = useRef(onNext);

  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  useEffect(() => {
    setSavedBilling(billing);
  }, [billing, setSavedBilling]);

  useEffect(() => {
    const checkoutResult = new URLSearchParams(window.location.search).get("checkout");
    if (checkoutResult === "cancelled") {
      history.replaceState(null, "", "/app/onboarding");
      sessionStorage.removeItem("pending-plan-code");
      window.setTimeout(() => setCheckoutError("Checkout was cancelled. Your plan has not changed."), 0);
      return;
    }
    if (checkoutResult !== "success") return;

    let cancelled = false;
    let attempts = 0;
    const expectedPlan = sessionStorage.getItem("pending-plan-code");
    const confirmSubscription = async () => {
      attempts += 1;
      if (expectedPlan) {
        await fetch("/api/billing/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planCode: expectedPlan }),
        }).catch(() => null);
      }
      const response = await fetch("/api/billing/current", { cache: "no-store" }).catch(() => null);
      const payload = response ? await response.json().catch(() => null) : null;
      const activePlan = payload?.subscription?.planCode?.toUpperCase();
      if (!cancelled && response?.ok && payload?.subscription?.status === "ACTIVE" && (!expectedPlan || activePlan === expectedPlan.toUpperCase())) {
        history.replaceState(null, "", "/app/onboarding");
        sessionStorage.removeItem("pending-plan-code");
        onNextRef.current();
        return;
      }
      if (!cancelled && attempts < 10) window.setTimeout(confirmSubscription, 1200);
      else if (!cancelled) setCheckoutError("Payment is complete, but activation is still processing. Refresh in a moment.");
    };
    void confirmSubscription();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/plans?active=true&public=true", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok || !Array.isArray(payload)) throw new Error(payload?.error || "Plans could not be loaded.");
        if (cancelled) return;
        setPlans(payload);
        const initial = payload.find((plan: Plan) => plan.code === savedPlanId)?.code ?? payload[0]?.code ?? null;
        setSelected(initial);
        setPlanId(initial);
      })
      .catch((error) => {
        if (!cancelled) setCheckoutError(error instanceof Error ? error.message : "Plans could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setPlansLoading(false);
      });
    return () => { cancelled = true; };
  }, [savedPlanId, setPlanId]);

  const scrollToCard = useCallback((index: number) => {
    const carousel = carouselRef.current;
    if (!carousel || plans.length === 0) return;
    const nextIndex = Math.max(0, Math.min(index, plans.length - 1));
    const card = carousel.children.item(nextIndex) as HTMLElement | null;
    if (!card) return;
    carousel.scrollTo({ left: card.offsetLeft - carousel.offsetLeft, behavior: "smooth" });
    setActiveCard(nextIndex);
  }, [plans.length]);

  function syncActiveCard() {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const cards = Array.from(carousel.children) as HTMLElement[];
    if (!cards.length) return;
    const nearest = cards.reduce((best, card, index) => {
      const distance = Math.abs(card.offsetLeft - carousel.offsetLeft - carousel.scrollLeft);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Number.POSITIVE_INFINITY });
    setActiveCard(nearest.index);
  }

  function choosePlan(plan: Plan, index: number) {
    setSelected(plan.code);
    setPlanId(plan.code);
    if (billing === "yearly" && plan.priceYearly === null) setBilling("monthly");
    if (billing === "monthly" && plan.priceMonthly === null && plan.priceYearly !== null) setBilling("yearly");
    scrollToCard(index);
  }

  async function submitFreePlan() {
    if (!selected) return;
    setLoading(true);
    setCheckoutError("");
    try {
      const response = await fetch("/api/onboarding/choose-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selected, billing }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Your plan selection could not be saved.");
      onNext();
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Your plan selection could not be saved.");
    } finally {
      setLoading(false);
    }
  }

  const selectedPlan = plans.find((plan) => plan.code === selected);
  const selectedPrice = selectedPlan ? (billing === "monthly" ? selectedPlan.priceMonthly : selectedPlan.priceYearly) : null;
  const isFreePlan = selectedPrice === 0;
  const isPaidPlan = typeof selectedPrice === "number" && selectedPrice > 0;
  const checkoutEnabled = selectedPlan?.checkoutEnabled[billing] ?? false;

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-5 pt-1 text-slate-900 dark:text-white">
      <PayNowModal
        open={showPayNow}
        onClose={() => setShowPayNow(false)}
        plan={selected ?? ""}
        billing={billing}
        price={selectedPrice ?? 0}
        currency={selectedPlan?.currency || "INR"}
        features={selectedPlan?.features ?? []}
        onPayNow={async () => {
          if (!selected) throw new Error("Choose a plan first.");
          const selection = await fetch("/api/onboarding/choose-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId: selected, billing }),
          });
          const selectionPayload = await selection.json().catch(() => ({}));
          if (!selection.ok) throw new Error(selectionPayload.error || "Your plan selection could not be saved.");
          const response = await fetch("/api/billing/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planCode: selected, billingCycle: billing, returnPath: "/app/onboarding", currency: displayCurrency }),
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok || !payload.checkoutUrl) throw new Error(payload.error || "Secure checkout could not be started.");
          sessionStorage.setItem("pending-plan-code", selected);
          window.location.assign(payload.checkoutUrl);
        }}
      />
      <EnterpriseContactModal open={enterpriseOpen} onClose={() => setEnterpriseOpen(false)} />

      <p className="text-left text-xs tracking-widest text-blue-500 dark:text-blue-400">STEP 4 OF 6 · CHOOSE PLAN</p>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 shrink-0 text-blue-500 dark:text-blue-400" />
            <h2 className="text-left text-2xl font-semibold">Pick a plan to continue</h2>
          </div>
          <p className="mt-2 text-left text-sm text-slate-600 dark:text-white/60">You can upgrade, downgrade, or cancel anytime.</p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3 lg:w-auto lg:shrink-0 lg:justify-end">
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white/70 p-1 shadow-sm dark:border-white/10 dark:bg-white/5">
            <button type="button" onClick={() => setBilling("monthly")} className={`rounded-lg px-3 py-1.5 text-xs transition ${billing === "monthly" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white"}`}>Monthly</button>
            <button type="button" onClick={() => setBilling("yearly")} className={`rounded-lg px-3 py-1.5 text-xs transition ${billing === "yearly" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white"}`}>Yearly <span className="ml-1 text-[10px] opacity-80">−20%</span></button>
          </div>
          <CurrencySwitcher symbolOnly currency={displayCurrency} currencies={availableCurrencies} onChange={setCurrency} className="shrink-0" />
        </div>
      </div>

      {checkoutError ? <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200">{checkoutError}</p> : null}

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs font-medium text-slate-500 dark:text-white/50">Swipe or use the arrows to compare plans</p>
        <div className="flex gap-2">
          <button type="button" aria-label="Previous plan" onClick={() => scrollToCard(activeCard - 1)} disabled={activeCard === 0} className="rounded-lg border border-slate-200 p-2 text-slate-700 disabled:opacity-35 dark:border-white/10 dark:text-white"><ChevronLeft size={16} /></button>
          <button type="button" aria-label="Next plan" onClick={() => scrollToCard(activeCard + 1)} disabled={activeCard >= plans.length - 1} className="rounded-lg border border-slate-200 p-2 text-slate-700 disabled:opacity-35 dark:border-white/10 dark:text-white"><ChevronRight size={16} /></button>
        </div>
      </div>

      {plansLoading ? (
        <div className="flex min-h-72 items-center justify-center text-sm text-slate-500 dark:text-white/55">Loading plans…</div>
      ) : (
        <div ref={carouselRef} onScroll={syncActiveCard} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {plans.map((plan, index) => {
            const isActive = selected === plan.code;
            const price = billing === "monthly" ? plan.priceMonthly : plan.priceYearly;
            return (
              <article key={plan.code} className={`glass glass-hover relative min-w-[88%] snap-start rounded-2xl border p-5 transition-all sm:min-w-[calc(50%-0.5rem)] xl:min-w-[calc(33.333%-0.667rem)] ${isActive ? "border-blue-500 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.5)]" : "border-slate-200/70 dark:border-white/10"}`}>
                {plan.tag ? <span className="absolute right-4 top-4 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] text-white">{plan.tag}</span> : null}
                <h3 className="mb-1 pr-16 text-lg font-medium">{plan.name}</h3>
                <p className="mb-3 min-h-10 text-sm text-slate-600 dark:text-white/60">{plan.description}</p>
                <div className="mb-4 text-2xl font-semibold">
                  {plan.isCustom ? "Custom" : price === null || price === undefined ? "Not offered" : priceFor(price, plan.currency)}
                  {!plan.isCustom && price !== null && price !== undefined ? <span className="ml-1 text-sm text-slate-500 dark:text-white/60">/ {billing === "monthly" ? "month" : "year"}</span> : null}
                </div>
                <ul className="mb-5 min-h-28 space-y-1.5 text-sm text-slate-600 dark:text-white/70">
                  {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2"><Check size={14} className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-400" /><span>{feature}</span></li>)}
                </ul>
                <button type="button" onClick={() => choosePlan(plan, index)} className={`w-full rounded-xl py-2 text-sm transition ${isActive ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-slate-900/5 text-slate-900 hover:bg-slate-900/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"}`}>{isActive ? "Selected ✓" : "Select plan"}</button>
              </article>
            );
          })}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="glass rounded-xl px-5 py-2.5 text-xs">← Back</button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {isFreePlan ? <button type="button" onClick={submitFreePlan} disabled={loading} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm text-white hover:bg-blue-500 disabled:opacity-50">{loading ? "Saving…" : "Continue →"}</button> : null}
          {isPaidPlan && checkoutEnabled ? <button type="button" onClick={() => setShowPayNow(true)} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm text-white hover:bg-blue-500">Continue to secure checkout →</button> : null}
          {isPaidPlan && !checkoutEnabled ? <span className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-2 text-sm text-amber-700 dark:text-amber-200">Currently unavailable</span> : null}
          {selectedPlan?.isCustom ? <button type="button" onClick={() => setEnterpriseOpen(true)} className="rounded-xl bg-[#1349A3] px-5 py-2.5 text-sm text-white hover:bg-[#1D5FC7]">Contact us →</button> : null}
          {selectedPlan && !selectedPlan.isCustom && (selectedPrice === null || selectedPrice === undefined) ? <span className="rounded-xl border border-slate-200 px-5 py-2 text-sm text-slate-500 dark:border-white/10 dark:text-white/60">Choose an available billing cycle</span> : null}
        </div>
      </div>
    </div>
  );
}
