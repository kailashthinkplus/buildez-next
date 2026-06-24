"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

// Modals
import PayNowModal from "./PayNowModal";
import StarterTrialMandateModal from "./StarterTrialMandateModal";

type Plan = {
  code: string;
  name: string;
  description: string;
  tag?: string | null;
  priceMonthly?: number | null;
  priceYearly?: number | null;
  features: string[];
};

export default function StepChoosePlan({
  onNext,
  onBack,
}: {
  onNext: (data?: any) => void;
  onBack: () => void;
}) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);

  const [showPayNow, setShowPayNow] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);

  /* --------------------------------------------------------
     LISTEN FOR PAYMENT SUCCESS EVENTS (from PayNowModal)
  -------------------------------------------------------- */
  useEffect(() => {
    function handleSuccess(e: any) {
      const data = e.detail;

      if (data?.success) {
        setShowPayNow(false); // close modal

        // Pass payment summary to parent (page.tsx)
        onNext({
          success: true,
          plan: data.plan,
          billingCycle: data.billingCycle,
          amount: data.amount,
          paymentId: data.paymentId,
          orderId: data.orderId,
        });
      }
    }

    window.addEventListener("BuildEZ-Payment-Success", handleSuccess);
    return () =>
      window.removeEventListener("BuildEZ-Payment-Success", handleSuccess);
  }, []);

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

    await fetch("/api/onboarding/choose-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: selected, billing }),
    });

    setLoading(false);

    // Continue to domain step
    onNext();
  }

  const selectedPlan = plans.find((p) => p.code === selected);

  const modalPrice = selectedPlan
    ? billing === "monthly"
      ? selectedPlan.priceMonthly ?? 0
      : selectedPlan.priceYearly ?? 0
    : 0;

  const modalFeatures = selectedPlan?.features ?? [];

const planCode = selected?.toUpperCase() ?? "";

const isFreePlan = planCode === "FREE";
const isStarter = planCode === "STARTER";
const isPro = planCode === "PRO";
const isBusiness = planCode === "BUSINESS";
const isEnterprise = planCode === "ENTERPRISE";

  return (
    <div className="max-w-6xl mx-auto space-y-4 pt-4 pb-8">

      {/* PAYMENT MODAL */}
      <PayNowModal
        open={showPayNow}
        onClose={() => setShowPayNow(false)}
        plan={selected ?? ""}
        billing={billing}
        price={modalPrice}
        features={modalFeatures}
        onPayNow={async () => {
          try {
            console.log("Fetching:", "/api/razorpay/order");

            // ---------------------------
            // 1. CREATE RAZORPAY ORDER
            // ---------------------------
            const orderRes = await fetch("/api/razorpay/order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: modalPrice,
                currency: "INR",
                receipt: `buildez_${selected}_${billing}_${Date.now()}`,
              }),
            });

            if (!orderRes.ok) {
              console.error("Order API failed:", await orderRes.text());
              throw new Error("Razorpay Order API returned error");
            }

            const orderData = await orderRes.json();

            const options = {
              key: orderData.key,
              amount: orderData.amount,
              currency: "INR",
              name: "BuildEZ",
              description: `${selected} Plan (${billing})`,
              order_id: orderData.orderId,

              handler: async function (response: any) {
                // ---------------------------
                // 2. VERIFY PAYMENT
                // ---------------------------
                const verifyRes = await fetch("/api/razorpay/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(response),
                });

                const verifyData = await verifyRes.json();
                if (!verifyData?.verified)
                  throw new Error("Signature verification failed");

                // ---------------------------
                // 3. ACTIVATE PAID SUBSCRIPTION
                // ---------------------------
                const activateRes = await fetch("/api/billing/activate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    planCode: selected,
                    billingCycle: billing,
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                    amount: modalPrice,
                  }),
                });

                const activateData = await activateRes.json();
                if (!activateData?.ok) {
                  console.error("Activation error:", activateData);
                  throw new Error("Subscription activation failed");
                }

                // ---------------------------
                // 4. SEND SUCCESS EVENT
                // ---------------------------
                window.dispatchEvent(
                  new CustomEvent("BuildEZ-Payment-Success", {
                    detail: {
                      success: true,
                      plan: selected,
                      billingCycle: billing,
                      amount: modalPrice,
                      paymentId: response.razorpay_payment_id,
                      orderId: response.razorpay_order_id,
                    },
                  })
                );
              },

              theme: { color: "#4F46E5" },
            };

            new window.Razorpay(options).open();
            return {};

          } catch (err) {
            console.error("🔥 Razorpay Flow Error:", err);
            throw err;
          }
        }}
      />

      {/* STARTER TRIAL MODAL */}
      <StarterTrialMandateModal
        open={showTrialModal}
        onClose={() => setShowTrialModal(false)}
      />

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

      {/* PLAN CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {plans.map((plan) => {
          const isActive = selected === plan.code;
          const price =
            billing === "monthly"
              ? plan.priceMonthly ?? 0
              : plan.priceYearly ?? 0;

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
                ₹{price.toLocaleString()}
                <span className="text-sm text-white/60 ml-1">
                  / {billing === "monthly" ? "month" : "year"}
                </span>
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
                onClick={() => setSelected(plan.code)}
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
      className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500"
    >
      Continue →
    </button>
  )}

  {(isStarter || isPro || isBusiness) && (
    <>
      {isStarter && (
        <button
          onClick={() => setShowTrialModal(true)}
          className="glass px-5 py-2 rounded-xl bg-green-600 text-white"
        >
          Start Free Trial
        </button>
      )}

      <button
        onClick={() => setShowPayNow(true)}
        className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500"
      >
        Pay Now →
      </button>
    </>
  )}

  {isEnterprise && (
    <button
      onClick={() => window.location.href="/contact-sales"}
      className="px-5 py-2 rounded-xl bg-purple-600 text-white"
    >
      Contact Sales →
    </button>
  )}

</div>
      </div>
    </div>
  );
}
