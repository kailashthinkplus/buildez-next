"use client";

import { useEffect, useState } from "react";
import { X, Check, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

export default function UpgradePlanModal({
  open,
  onClose,
  currentPlan,
}: {
  open: boolean;
  onClose: () => void;
  currentPlan: string | null;
}) {
  const [plans, setPlans] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(currentPlan);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  /* Load public plans */
  useEffect(() => {
    if (!open) return;
    fetch("/api/plans?active=true&public=true")
      .then((res) => res.json())
      .then((data) => {
        setPlans(data);
        if (!selected && data?.length) {
          setSelected(currentPlan ?? data[0].code);
        }
      });
  }, [open]);

  if (!open) return null;

  /* Razorpay Order Fix (Receipt < 40 chars) */
  async function startPayment(plan: any) {
    try {
      const price =
        billing === "monthly" ? plan.priceMonthly : plan.priceYearly;

      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: price,
          currency: "INR",
          receipt: `bz_${plan.code}_${Math.random()
            .toString(36)
            .slice(2, 9)}`,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      new window.Razorpay({
        key: orderData.key,
        amount: orderData.amount,
        order_id: orderData.orderId,
        currency: "INR",
        name: "BuildEZ",
        description: `${plan.name} Plan Upgrade`,
        handler: async function (response: any) {
          await fetch("/api/billing/activate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              planCode: plan.code,
              billingCycle: billing,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              amount: price,
            }),
          });

          window.location.reload();
        },
        theme: { color: "#4F46E5" },
      }).open();
    } catch (err) {
      console.error("Payment Error:", err);
    }
  }

  return (
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
          bg-[radial-gradient(circle_at_top,rgba(30,58,138,0.55),rgba(2,6,23,1))]
          border border-white/10
        "
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/70 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="h-5 w-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">
            Upgrade Your Plan
          </h2>
        </div>

        <p className="text-white/60 text-sm mb-8">
          Select a plan to upgrade. You can change or cancel anytime.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setBilling("monthly")}
            className={`text-sm ${
              billing === "monthly"
                ? "text-blue-400"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Monthly
          </button>

          <div
            onClick={() =>
              setBilling(billing === "monthly" ? "yearly" : "monthly")
            }
            className="w-14 h-7 rounded-full glass bg-white/10 cursor-pointer flex items-center px-1"
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
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Yearly
          </button>

          {billing === "yearly" && (
            <span className="text-[11px] text-green-400">Save 20%</span>
          )}
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const price =
              billing === "monthly"
                ? plan.priceMonthly
                : plan.priceYearly;

            const isActive = selected === plan.code;

            return (
              <div
                key={plan.code}
                className={`
                  p-5 rounded-2xl border glass transition-all cursor-pointer
                  ${
                    isActive
                      ? "border-blue-500 bg-white/[0.08] shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      : "border-white/10 hover:border-blue-400/40 bg-white/[0.03]"
                  }
                `}
                onClick={() => setSelected(plan.code)}
              >
                {currentPlan === plan.code && (
                  <div className="text-[10px] px-2 py-1 rounded-full bg-blue-600 text-white absolute top-4 right-4">
                    Current Plan
                  </div>
                )}

                <h3 className="text-lg font-medium text-white mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-white/60 mb-3">
                  {plan.description}
                </p>

                <div className="text-2xl font-semibold mb-4">
                  ₹{price.toLocaleString()}
                  <span className="text-sm text-white/50 ml-1">
                    / {billing === "monthly" ? "month" : "year"}
                  </span>
                </div>

                <ul className="space-y-1.5 text-sm text-white/70 mb-6">
                  {plan.features.map((f: string) => (
                    <li key={f} className="flex gap-2">
                      <Check className="h-4 w-4 text-blue-400 mt-[2px]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => startPayment(plan)}
                  className={`
                    w-full py-2 rounded-xl text-sm transition
                    ${
                      isActive
                        ? "bg-blue-600 text-white hover:bg-blue-500"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }
                  `}
                >
                  {currentPlan === plan.code ? "Selected ✓" : "Upgrade →"}
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
