"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

// Modals
import PayNowModal from "./PayNowModal";
import EnterpriseContactModal from "@/components/billing/EnterpriseContactModal";
import CurrencySwitcher from "@/components/billing/CurrencySwitcher";
import { useDisplayCurrency } from "@/lib/useDisplayCurrency";

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
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const { currency: displayCurrency, setCurrency, availableCurrencies, priceFor } = useDisplayCurrency();

  const [showPayNow, setShowPayNow] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [enterpriseOpen, setEnterpriseOpen] = useState(false);

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
        onNext();
        return;
      }
      if (!cancelled && attempts < 10) window.setTimeout(confirmSubscription, 1200);
      else if (!cancelled) setCheckoutError("Payment is complete, but activation is still processing. Refresh in a moment.");
    };
    void confirmSubscription();
    return () => { cancelled = true; };
  }, [onNext]);

  /* --------------------------------------------------------
     LOAD PUBLIC PLANS
  -------------------------------------------------------- */
  useEffect(() => {
    fetch(`/api/plans?active=true&public=true`, { cache: "no-store" })
      .then((res) => res.json())
      .then((res) => {
        if (!Array.isArray(res)) return;
        setPlans(res);

        if (res.length > 0) {
          setSelected(res[0].code); // auto-select first plan
        }
      })
      .catch(() => {});
  }, []);

  /* --------------------------------------------------------
     SAVE PLAN SELECTION + MOVE TO DOMAIN STEP (free plan)
  -------------------------------------------------------- */
  async function submitFreePlan() {
    if (!selected) return;
    setLoading(true);

    const response = await fetch("/api/onboarding/choose-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: selected, billing }),
    });

    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setCheckoutError(payload.error || "Your plan selection could not be saved.");
      return;
    }

    // Continue to domain step
    onNext();
  }

  const selectedPlan = plans.find((p) => p.code === selected);

  const selectedPrice = selectedPlan
    ? billing === "monthly"
      ? selectedPlan.priceMonthly
      : selectedPlan.priceYearly
    : null;

  const modalPrice = selectedPrice ?? 0;

  const modalFeatures = selectedPlan?.features ?? [];

  const isFreePlan = selectedPrice === 0;
  const isPaidPlan = typeof selectedPrice === "number" && selectedPrice > 0;
  const checkoutEnabled = selectedPlan?.checkoutEnabled[billing] ?? false;

  return (
    <div className="max-w-6xl mx-auto space-y-4 pt-4 pb-8">

      {/* PAYMENT MODAL */}
      <PayNowModal
        open={showPayNow}
        onClose={() => setShowPayNow(false)}
        plan={selected ?? ""}
        billing={billing}
        price={modalPrice}
        currency={selectedPlan?.currency || "INR"}
        features={modalFeatures}
        onPayNow={async () => {
          if (!selected) throw new Error("Choose a plan first.");
          const selection = await fetch("/api/onboarding/choose-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId: selected, billing }),
          });
          if (!selection.ok) throw new Error("Your plan selection could not be saved.");
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

      {/* HEADER */}
      <p className="text-left text-xs tracking-widest text-blue-400">
        STEP 3 OF 5 · CHOOSE PLAN
      </p>

      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-blue-400" />
        <h2 className="text-left text-2xl font-semibold">
          Pick a plan to continue
        </h2>
      </div>

      <p className="text-left text-sm text-white/60 mb-4">
        You can upgrade, downgrade, or cancel anytime.
      </p>
      {checkoutError ? <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">{checkoutError}</p> : null}

      {/* BILLING SWITCH */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => setBilling("monthly")}
          className={`text-sm transition ${
            billing === "monthly"
              ? "text-blue-400 font-medium"
              : "text-white/60 hover:text-white/80"
          }`}
        >
          Monthly
        </button>

        <div
          className="w-14 h-7 glass relative rounded-full cursor-pointer flex items-center px-1"
          onClick={() =>
            setBilling(billing === "monthly" ? "yearly" : "monthly")
          }
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-5 h-5 rounded-full bg-blue-500"
            style={{
              marginLeft: billing === "yearly" ? "calc(100% - 1.75rem)" : "0",
            }}
          />
        </div>

        <button
          onClick={() => setBilling("yearly")}
          className={`text-sm transition ${
            billing === "yearly"
              ? "text-blue-400 font-medium"
              : "text-white/60 hover:text-white/80"
          }`}
        >
          Yearly
        </button>

        {billing === "yearly" && (
          <span className="text-[11px] text-green-400">Save 20%</span>
        )}
      </div>

      <div className="mb-4 flex justify-center">
        <CurrencySwitcher currency={displayCurrency} currencies={availableCurrencies} onChange={setCurrency} />
      </div>

      {/* PLAN CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {plans.map((plan) => {
          const isActive = selected === plan.code;
          const price =
            billing === "monthly"
              ? plan.priceMonthly
              : plan.priceYearly;

          return (
            <div
              key={plan.code}
              className={`
                glass glass-hover p-5 rounded-2xl border transition-all relative
                ${
                  isActive
                    ? "border-blue-500 bg-[rgba(59,130,246,0.12)] shadow-[0_0_0_1px_rgba(59,130,246,0.6)]"
                    : "border-white/10 hover:border-blue-400/40"
                }
              `}
            >
              {plan.tag && (
                <span className="absolute top-4 right-4 text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white">
                  {plan.tag}
                </span>
              )}

              <h3 className="text-lg font-medium mb-1">{plan.name}</h3>
              <p className="text-sm text-white/60 mb-3">{plan.description}</p>

              <div className="text-2xl font-semibold mb-4">
                {plan.isCustom ? "Custom" : price === null || price === undefined ? "Not offered" : priceFor(price, plan.currency)}
                {!plan.isCustom && price !== null && price !== undefined && <span className="text-sm text-white/60 ml-1">
                  / {billing === "monthly" ? "month" : "year"}
                </span>}
              </div>

              <ul className="space-y-1.5 text-sm text-white/70 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={14} className="mt-[2px] text-blue-400" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  setSelected(plan.code);
                  if (billing === "yearly" && plan.priceYearly === null) setBilling("monthly");
                  if (billing === "monthly" && plan.priceMonthly === null && plan.priceYearly !== null) setBilling("yearly");
                }}
                className={`
                  w-full py-2 rounded-xl text-sm transition
                  ${
                    isActive
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }
                `}
              >
                {isActive ? "Selected ✓" : "Select Plan"}
              </button>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="glass px-5 py-2 rounded-[12px] text-xs"
        >
          ← Back
        </button>

<div className="flex gap-3">

  {isFreePlan && (
    <button
      onClick={submitFreePlan}
      disabled={loading}
      className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
    >
      {loading ? "Saving…" : "Continue →"}
    </button>
  )}

  {isPaidPlan && checkoutEnabled && (
    <button
        onClick={() => setShowPayNow(true)}
        className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500"
      >
        Continue to secure checkout →
      </button>
  )}

  {isPaidPlan && !checkoutEnabled && (
    <span className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-5 py-2 text-sm text-amber-200">
      Currently unavailable
    </span>
  )}

  {selectedPlan?.isCustom && (
    <button
      onClick={() => setEnterpriseOpen(true)}
      className="px-5 py-2 rounded-xl bg-[#1349A3] text-white hover:bg-[#1D5FC7]"
    >
      Contact us →
    </button>
  )}

  {selectedPlan && !selectedPlan.isCustom && (selectedPrice === null || selectedPrice === undefined) && (
    <span className="rounded-xl border border-white/10 px-5 py-2 text-sm text-white/60">
      Choose an available billing cycle
    </span>
  )}

</div>
      </div>
    </div>
  );
}
