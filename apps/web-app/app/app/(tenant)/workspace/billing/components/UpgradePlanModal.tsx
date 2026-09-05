"use client";

import { useEffect, useRef, useState } from "react";
import { X, Check, ChevronLeft, ChevronRight, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardModalPortal } from "../../../components/ui/DashboardModalPortal";
import { useDisplayCurrency } from "@/lib/useDisplayCurrency";
import CurrencySwitcher from "@/components/billing/CurrencySwitcher";

type BillingCycle = "monthly" | "yearly";

type UpgradePlan = {
  code: string;
  name: string;
  description: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  currency: string;
  isCustom: boolean;
  checkoutEnabled: Record<BillingCycle, boolean>;
  features: string[];
  featureTable?: Array<{ key: string; label: string; value: string; included: boolean; priority: number }>;
  maxSites: number;
  maxPages: number;
  aiCredits: number;
  teamMembers: number;
};

export default function UpgradePlanModal({
  open,
  onClose,
  currentPlan,
}: {
  open: boolean;
  onClose: () => void;
  currentPlan: string | null;
}) {
  const [plans, setPlans] = useState<UpgradePlan[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [paying, setPaying] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; finalAmount: number } | null>(null);
  const { currency: displayCurrency, setCurrency, availableCurrencies, priceFor } = useDisplayCurrency();
  const carouselRef = useRef<HTMLDivElement>(null);

  function moveCarousel(direction: -1 | 1) {
    carouselRef.current?.scrollBy({
      left: direction * carouselRef.current.clientWidth,
      behavior: "smooth",
    });
  }

  /* Load public plans */
  useEffect(() => {
    if (!open) return;
    fetch("/api/plans?active=true&public=true")
      .then((res) => res.json())
      .then((data) => {
        const rows = Array.isArray(data) ? data : [];
        setPlans(rows);
        const currentIndex = rows.findIndex((plan) => plan.code.toUpperCase() === currentPlan?.toUpperCase());
        setSelected(rows[currentIndex + 1]?.code ?? (currentIndex < 0 ? rows[0]?.code : null));
      });
  }, [currentPlan, open]);

  if (!open) return null;

  async function applyCoupon() {
    if (!couponInput.trim() || !selected) return;
    setCouponBusy(true);
    setCouponError("");
    try {
      const res = await fetch("/api/billing/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), planCode: selected, billingCycle: billing }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.valid) throw new Error(data.error || "That coupon code isn't valid.");
      setAppliedCoupon({ code: data.code, discountAmount: data.discountAmount, finalAmount: data.finalAmount });
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err instanceof Error ? err.message : "That coupon code isn't valid.");
    } finally {
      setCouponBusy(false);
    }
  }

  async function startPayment(plan: UpgradePlan) {
    const price =
      billing === "monthly" ? plan.priceMonthly : plan.priceYearly;
    if (price === null || !plan.checkoutEnabled?.[billing]) {
      setError(
        `${plan.name} is not available with ${billing} billing. Choose another billing cycle or plan.`,
      );
      return;
    }

    setPaying(plan.code);
    setError("");
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: plan.code,
          billingCycle: billing,
          returnPath: "/app/workspace/billing",
          currency: displayCurrency,
          couponCode: plan.code === selected ? appliedCoupon?.code : undefined,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || typeof payload.checkoutUrl !== "string") {
        throw new Error(payload.error || "Checkout could not be started.");
      }
      sessionStorage.setItem("pending-plan-code", plan.code);
      window.location.assign(payload.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout could not be started.");
      setPaying(null);
    }
  }

  return (
    <DashboardModalPortal onClose={onClose}>
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* DIM BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* MODAL */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="
          relative w-full max-w-5xl rounded-2xl p-8 shadow-xl
          dashboard-modal-surface border dashboard-border max-h-[calc(100dvh-2rem)] overflow-y-auto
        "
      >
        {/* Header */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-semibold">
              Upgrade Your Plan
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Billing Toggle */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setBilling("monthly")}
                className={`text-sm ${
                  billing === "monthly"
                    ? "text-blue-400"
                    : "dashboard-muted hover:text-[var(--dashboard-text)]"
                }`}
              >
                Monthly
              </button>

              <div
                onClick={() =>
                  setBilling(billing === "monthly" ? "yearly" : "monthly")
                }
                className="w-14 h-7 rounded-full dashboard-subtle cursor-pointer flex items-center px-1"
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="w-5 h-5 rounded-full bg-blue-500 shadow-lg"
                  style={{
                    marginLeft: billing === "yearly" ? "calc(100% - 1.75rem)" : "0",
                  }}
                />
              </div>

              <button
                onClick={() => setBilling("yearly")}
                className={`text-sm ${
                  billing === "yearly"
                    ? "text-blue-400"
                    : "dashboard-muted hover:text-[var(--dashboard-text)]"
                }`}
              >
                Yearly
              </button>

              {billing === "yearly" && (
                <span className="text-[11px] text-green-400">Save 20%</span>
              )}
            </div>

            <button
              onClick={onClose}
              className="dashboard-muted hover:text-[var(--dashboard-text)]"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <p className="dashboard-muted text-sm mb-5">
          Select a plan to upgrade. You can change or cancel anytime.
        </p>
        {error && <p className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">{error}</p>}

        {/* Plan Cards */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <CurrencySwitcher currency={displayCurrency} currencies={availableCurrencies} onChange={setCurrency} />
          <div className="hidden gap-2 sm:flex">
            <button onClick={() => moveCarousel(-1)} aria-label="Previous plans" className="dashboard-card grid h-9 w-9 place-items-center rounded-xl"><ChevronLeft size={16} /></button>
            <button onClick={() => moveCarousel(1)} aria-label="Next plans" className="dashboard-card grid h-9 w-9 place-items-center rounded-xl"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="mb-4">
          {appliedCoupon ? (
            <div className="flex items-center justify-between dashboard-card rounded-xl px-4 py-2 text-sm border border-emerald-500/30">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{appliedCoupon.code} applied to {selected}</span>
              <button type="button" onClick={() => { setAppliedCoupon(null); setCouponInput(""); }} className="text-xs dashboard-faint hover:dashboard-muted">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Coupon code"
                disabled={!selected}
                className="dashboard-card flex-1 min-w-0 rounded-xl border-0 px-3 py-2 text-sm outline-none disabled:opacity-50"
              />
              <button type="button" onClick={applyCoupon} disabled={couponBusy || !couponInput.trim() || !selected} className="dashboard-subtle dashboard-hover shrink-0 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-40">
                {couponBusy ? "Checking…" : "Apply"}
              </button>
            </div>
          )}
          {couponError && <p className="mt-1.5 text-xs text-red-500">{couponError}</p>}
          {!selected && !couponError ? <p className="mt-1.5 text-xs dashboard-faint">Select a plan below to apply a coupon.</p> : null}
        </div>
        <div ref={carouselRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {plans.filter((_, index) => {
            const currentIndex = plans.findIndex((item) => item.code.toUpperCase() === currentPlan?.toUpperCase());
            return currentIndex < 0 || index > currentIndex;
          }).map((plan) => {
            const price =
              billing === "monthly"
                ? plan.priceMonthly
                : plan.priceYearly;
            const checkoutEnabled =
              price !== null && Boolean(plan.checkoutEnabled?.[billing]);

            const isActive = selected === plan.code;

            return (
              <div
                key={plan.code}
                className={`
                  min-w-[85%] shrink-0 snap-start p-5 rounded-2xl border glass transition-all cursor-pointer
                  sm:min-w-[calc((100%_-_1rem)/2)] md:min-w-[calc((100%_-_2rem)/3)]
                  ${
                    isActive
                      ? "border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.18)]"
                      : "dashboard-border dashboard-hover"
                  }
                `}
                onClick={() => { if (plan.code !== selected) { setSelected(plan.code); setAppliedCoupon(null); setCouponError(""); } }}
              >
                <h3 className="text-lg font-medium mb-1 break-words">
                  {plan.name}
                </h3>
                <p className="text-sm dashboard-muted mb-3 break-words">
                  {plan.description}
                </p>

                <div className="text-2xl font-semibold mb-4">
                  {plan.isCustom
                    ? "Custom"
                    : price === null
                      ? "Not offered"
                      : priceFor(price, plan.currency)}
                  {!plan.isCustom && price !== null ? (
                    <span className="text-sm dashboard-faint ml-1">
                      / {billing === "monthly" ? "month" : "year"}
                    </span>
                  ) : null}
                  {appliedCoupon && isActive && price !== null ? (
                    <span className="block text-xs font-normal text-emerald-600 dark:text-emerald-400 mt-1">
                      {appliedCoupon.code}: {priceFor(price - appliedCoupon.discountAmount, plan.currency)} after discount
                    </span>
                  ) : null}
                </div>

                <ul className="space-y-1.5 text-sm dashboard-muted mb-6">
                  {plan.features.slice(0, 7).map((f: string) => (
                    <li key={f} className="flex gap-2">
                      <Check className="h-4 w-4 shrink-0 text-blue-400 mt-[2px]" />
                      <span className="min-w-0 break-words">{f}</span>
                    </li>
                  ))}
                  {(plan.featureTable || [])
                    .filter((row) => !row.included)
                    .slice(0, 3)
                    .map((row) => (
                      <li key={row.key} className="flex gap-2 opacity-60">
                        <X className="h-4 w-4 shrink-0 mt-[2px]" />
                        <span className="min-w-0 break-words">{row.label}</span>
                      </li>
                    ))}
                </ul>

                <button
                  onClick={() =>
                    plan.isCustom
                      ? window.location.assign("/app/plans")
                      : void startPayment(plan)
                  }
                  disabled={Boolean(paying) || (!plan.isCustom && !checkoutEnabled)}
                  className={`
                    w-full py-2 rounded-xl text-sm transition
                    ${
                      isActive
                        ? "bg-blue-600 text-white hover:bg-blue-500"
                        : "dashboard-subtle dashboard-hover"
                    }
                  `}
                >
                  {paying === plan.code
                    ? "Opening secure checkout…"
                    : plan.isCustom
                      ? "View contact options →"
                      : !checkoutEnabled
                        ? "Cycle unavailable"
                        : isActive
                          ? "Continue to payment →"
                          : "Select plan"}
                </button>
              </div>
            );
          })}
          {plans.length > 0 && plans.every((plan, index) => {
            const currentIndex = plans.findIndex((item) => item.code.toUpperCase() === currentPlan?.toUpperCase());
            return currentIndex >= 0 && index <= currentIndex;
          }) ? <div className="min-w-full rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center text-sm text-emerald-600 dark:text-emerald-400">You already have the highest available plan.</div> : null}
        </div>
      </motion.div>
    </div>
    </DashboardModalPortal>
  );
}
