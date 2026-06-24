"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Sparkles, CreditCard } from "lucide-react";
import { useOnboarding } from "../OnboardingContext";

export default function StepFinish({
  onBack,
  paymentSummary,
}: {
  onBack: () => void;
  paymentSummary: {
    plan: string;
    billingCycle: string;
    amount: number;
    paymentId: string;
    orderId?: string;
  } | null;
}) {
  const { refreshFromServer } = useOnboarding();

  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // ⭐ prevents onboarding context from rerendering wrong step
  const [locked, setLocked] = useState(false);

  const [subscription, setSubscription] = useState<{
  planCode: string;
  billingCycle: string;
  amountPaid: number;
  razorpayPaymentId: string;
  razorpayOrderId?: string;
} | null>(null);

  /* -------------------------------------------------------------
     TYPEWRITER EFFECT
  ------------------------------------------------------------- */
  const [typedText, setTypedText] = useState("");
  const fullText =
    "Your workspace will be created and optimised with compliance & AI-powered defaults.";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        setTimeout(() => {
          i = 0;
          setTypedText("");
        }, 800);
      }
    }, 45);

    return () => clearInterval(interval);
  }, []);

  /* -------------------------------------------------------------
   LOAD PAYMENT FROM DATABASE
------------------------------------------------------------- */
useEffect(() => {
  async function loadSubscription() {
    try {
      const res = await fetch("/api/billing/current", {
        cache: "no-store",
      });

      const data = await res.json();

      if (data?.ok && data.subscription) {
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error("Failed loading subscription", err);
    }
  }

  loadSubscription();
}, []);

  /* -------------------------------------------------------------
     FINAL ACTIVATION CALL — FIXED
  ------------------------------------------------------------- */
  async function finish() {
    if (!accepted) return;

    // ⭐ Lock UI so step manager cannot re-render
    setLocked(true);
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding/finish", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setLoading(false);
        setLocked(false);
        alert(data?.error || "Something went wrong. Please try again.");
        return;
      }

      // Background compliance scan
      fetch("/api/compliance/scan", { method: "POST" }).catch(() => {});

      // ⭐ Refresh onboarding + tenant state
      await refreshFromServer();

      // ⭐ Redirect IMMEDIATELY (avoid UI step flicker)
      window.location.replace("/app/dashboard");
      return;

    } catch (err) {
      console.error("❌ FINISH ERROR:", err);
      setLoading(false);
      setLocked(false);
      alert("Unexpected error occurred. Try again.");
    }
  }

  /* -------------------------------------------------------------
     LOCKED STATE UI — prevents step bounce
  ------------------------------------------------------------- */
  if (locked) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Setting up your workspace…
        </p>
      </div>
    );
  }

  /* -------------------------------------------------------------
     NORMAL UI
  ------------------------------------------------------------- */
  return (
    <div className="max-w-4xl mx-auto text-left text-slate-900 dark:text-white">

      {/* BADGE */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-9 w-9 rounded-lg bg-blue-500/15 flex items-center justify-center">
          <CheckCircle2 size={18} className="text-blue-500 dark:text-blue-400" />
        </div>
        <p className="text-sm font-medium tracking-wide text-blue-600 dark:text-blue-400">
          Final step
        </p>
      </div>

      {/* TITLE */}
      <h2 className="text-2xl font-semibold leading-snug mb-3">
        Your BuildEZ workspace is ready
      </h2>

      {/* SUBTITLE */}
      <p className="text-sm text-slate-600 dark:text-white/65 max-w-xl mb-8">
        We’re preparing your AI-powered dashboard and optimising everything for the best experience.
      </p>

      {/* PAYMENT SUMMARY */}
      {(subscription || paymentSummary) && (
        <div className="glass p-5 rounded-2xl mb-10 border border-white/10 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="text-blue-400" size={18} />
            <h3 className="text-sm font-semibold text-white/90">
              Payment Summary
            </h3>
          </div>

          <div className="text-sm text-white/80 space-y-1.5">
            <p>
              <span className="text-white/50">Plan:</span>{" "}
              <span className="font-medium capitalize">
                {subscription?.planCode ?? paymentSummary?.plan}
              </span>
            </p>

            <p>
              <span className="text-white/50">Billing Cycle:</span>{" "}
              <span className="font-medium capitalize">
                {subscription?.billingCycle ?? paymentSummary?.billingCycle}
              </span>
            </p>

            <p>
              <span className="text-white/50">Amount Paid:</span>{" "}
              <span className="font-medium">
                ₹
                {(
                  subscription?.amountPaid ??
                  paymentSummary?.amount ??
                  0
                ).toLocaleString()}
              </span>
            </p>

            <p>
              <span className="text-white/50">Payment ID:</span>{" "}
              <span className="font-mono text-[13px]">
                {subscription?.razorpayPaymentId ??
                  paymentSummary?.paymentId}
              </span>
            </p>

            {(subscription?.razorpayOrderId ||
              paymentSummary?.orderId) && (
              <p>
                <span className="text-white/50">Order ID:</span>{" "}
                <span className="font-mono text-[13px]">
                  {subscription?.razorpayOrderId ??
                    paymentSummary?.orderId}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* TYPEWRITER */}
      <div className="glass px-5 py-3 rounded-xl text-[13px] text-slate-600 dark:text-white/70 mb-12">
        <div className="flex items-start gap-2">
          <Sparkles size={14} className="mt-[1px] text-blue-500/80 dark:text-blue-400/80" />
          <span className="min-h-[18px]">{typedText}</span>
        </div>
      </div>

      {/* CONSENT */}
      <label className="flex items-start gap-3 cursor-pointer mb-12 text-sm text-slate-700 dark:text-white/70">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border border-white/30 bg-transparent"
        />
        <span>
          I agree to BuildEZ’s Terms, Privacy Policy, and consent to receive onboarding updates via Phone & WhatsApp.
        </span>
      </label>

      {/* BUTTONS */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="glass px-6 py-2.5 rounded-xl text-xs hover:bg-white/20"
        >
          ← Back
        </button>

        <button
          onClick={finish}
          disabled={!accepted || loading}
          className={`px-8 py-3 rounded-xl text-sm font-medium text-white transition 
            ${!accepted || loading
              ? "bg-blue-600/40 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500"}
          `}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Launching…
            </span>
          ) : (
            "Launch BuildEZ →"
          )}
        </button>
      </div>
    </div>
  );
}
