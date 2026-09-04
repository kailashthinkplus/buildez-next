"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, AlertTriangle, RotateCcw } from "lucide-react";

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function PayNowModal({
  open = false,
  onClose = () => {},
  plan = "",
  billing = "monthly",
  price = 0,
  currency = "INR",
  features = [],
  onPayNow = async () => {},
}: {
  open?: boolean;
  onClose?: () => void;
  plan?: string;
  billing?: string;
  price?: number;
  currency?: string;
  features?: string[];
  onPayNow?: (couponCode?: string) => Promise<unknown>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // COUPON STATE
  const [couponInput, setCouponInput] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; finalAmount: number } | null>(null);

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponBusy(true);
    setCouponError("");
    try {
      const res = await fetch("/api/billing/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), planCode: plan, billingCycle: billing }),
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

  // NEW STATES
  const [status, setStatus] = useState<"idle" | "success" | "failed">("idle");
  const [summary, setSummary] = useState<any>(null);

  /* --------------------------------------------------------
     LISTEN FOR BUILD-EZ PAYMENT SUCCESS
  -------------------------------------------------------- */
  useEffect(() => {
    function handleSuccess(e: any) {
      const data = e.detail;

      // SUCCESS UI
      setStatus("success");
      setLoading(false);
      setSummary(data);

      // Auto close after showing success animation
      setTimeout(() => {
        onClose();
        setStatus("idle");
        setError("");
      }, 2200);
    }

    window.addEventListener("BuildEZ-Payment-Success", handleSuccess);
    return () =>
      window.removeEventListener("BuildEZ-Payment-Success", handleSuccess);
  }, [onClose]);

  if (!open) return null;

  /* --------------------------------------------------------
     HANDLE PAYMENT ATTEMPT
  -------------------------------------------------------- */
  async function handlePay() {
    try {
      setLoading(true);
      setError("");
      setStatus("idle");

      // Open the hosted subscription checkout.
      await Promise.resolve().then(() => onPayNow(appliedCoupon?.code));
    } catch (err: any) {
      console.error("❌ PayNowModal ERROR:", err);

      setStatus("failed");
      setError(
        err?.message || "Payment failed. Please try again."
      );
      setLoading(false);
    }
  }

  /* --------------------------------------------------------
     JSX UI
  -------------------------------------------------------- */
  return (
    <div
      className="
        fixed inset-0 z-[9999]
        flex items-center justify-center
        bg-black/80 backdrop-blur-xl backdrop-saturate-150
      "
    >
      <div
        className="
          relative w-full max-w-lg p-8 rounded-2xl
          bg-white/10 border border-white/20
          backdrop-blur-2xl backdrop-saturate-200
          shadow-[0_30px_120px_-10px_rgba(0,0,0,0.7)]
          animate-[fadeIn_0.2s_ease-out]
        "
      >
        {/* CLOSE BUTTON */}
        {status === "idle" && (
          <button
            onClick={onClose}
            className="
              absolute right-4 top-4 p-2 rounded-full
              hover:bg-white/10 transition
            "
          >
            <X className="h-5 w-5 text-white/80" />
          </button>
        )}

        {/* ======================================
            SUCCESS UI
        ====================================== */}
        {status === "success" && (
          <div className="text-center py-10 animate-fade-in">
            <CheckCircle2 size={56} className="mx-auto text-green-400 mb-4" />

            <h2 className="text-xl font-semibold text-white mb-2">
              Payment Successful
            </h2>

            <p className="text-white/70 text-sm mb-6">
              Your subscription has been activated.
            </p>

            <div className="glass p-4 rounded-xl text-left text-white/80 text-sm space-y-1 border border-white/10">
              <p><span className="text-white/50">Plan:</span> {summary?.plan}</p>
              <p><span className="text-white/50">Billing:</span> {summary?.billingCycle}</p>
              <p><span className="text-white/50">Amount:</span> ₹{summary?.amount}</p>
              <p><span className="text-white/50">Payment ID:</span> {summary?.paymentId}</p>
            </div>

            <p className="text-xs text-white/40 mt-6">
              Redirecting…
            </p>
          </div>
        )}

        {/* ======================================
            FAILURE UI
        ====================================== */}
        {status === "failed" && (
          <div className="text-center py-10 animate-fade-in">
            <AlertTriangle size={56} className="mx-auto text-red-400 mb-4" />

            <h2 className="text-xl font-semibold text-white mb-2">
              Payment Failed
            </h2>

            <p className="text-white/70 text-sm mb-6">{error}</p>

            <button
              onClick={handlePay}
              className="
                w-full py-3 rounded-xl text-sm font-medium
                bg-red-600 text-white hover:bg-red-500
                flex items-center justify-center gap-2
              "
            >
              <RotateCcw size={16} />
              Retry Payment
            </button>

            <button
              onClick={onClose}
              className="
                mt-4 text-xs text-white/40 hover:text-white/60
              "
            >
              Cancel
            </button>
          </div>
        )}

        {/* ======================================
            NORMAL PAYMENT UI
        ====================================== */}
        {status === "idle" && (
          <>
            {/* HEADER */}
            <h2 className="text-center text-2xl font-semibold text-white mb-6">
              Complete Your Purchase
            </h2>

            {/* PLAN + PRICE */}
            <div className="text-center mb-6">
              <p className="text-white/80 text-lg font-medium capitalize">
                {plan} — {billing}
              </p>

              {appliedCoupon ? (
                <p className="text-4xl font-bold mt-2 drop-shadow-sm">
                  {formatMoney(appliedCoupon.finalAmount, currency)}
                  <span className="text-white/60 text-sm ml-1">/ {billing === "monthly" ? "month" : "year"}</span>
                  <span className="block text-sm font-normal text-white/40 line-through mt-1">{formatMoney(price ?? 0, currency)}</span>
                </p>
              ) : (
                <p className="text-4xl font-bold mt-2 drop-shadow-sm">
                  {formatMoney(price ?? 0, currency)}
                  <span className="text-white/60 text-sm ml-1">
                    / {billing === "monthly" ? "month" : "year"}
                  </span>
                </p>
              )}
            </div>

            {/* COUPON */}
            <div className="mb-6">
              {appliedCoupon ? (
                <div className="flex items-center justify-between glass px-4 py-2.5 rounded-xl text-sm border border-emerald-400/30">
                  <span className="text-emerald-300 font-medium">{appliedCoupon.code} applied</span>
                  <button type="button" onClick={() => { setAppliedCoupon(null); setCouponInput(""); }} className="text-white/50 hover:text-white/80 text-xs">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="glass px-4 py-2.5 rounded-xl text-sm flex-1 min-w-0 border border-white/10"
                  />
                  <button type="button" onClick={applyCoupon} disabled={couponBusy || !couponInput.trim()} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 disabled:opacity-40 shrink-0">
                    {couponBusy ? "Checking…" : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="text-red-400 text-xs mt-2">{couponError}</p>}
            </div>

            {/* FEATURES */}
            <div className="max-h-48 overflow-auto px-3 mb-8 space-y-2">
              {features.length > 0 ? (
                features.map((f: string, i: number) => (
                  <p
                    key={i}
                    className="text-white/75 text-sm flex items-center gap-2"
                  >
                    <span className="w-2 h-2 bg-blue-400 rounded-full" />
                    {f}
                  </p>
                ))
              ) : (
                <p className="text-white/50 text-sm">No features listed.</p>
              )}
            </div>

            {/* CHECKOUT ERROR */}
            {error && (
              <p className="text-red-400 text-xs text-center mb-3">{error}</p>
            )}

            {/* PAY BUTTON */}
            <button
              onClick={handlePay}
              disabled={loading}
              className={`
                w-full py-3 rounded-xl
                text-sm font-medium transition
                ${
                  loading
                    ? "bg-blue-600/40 text-white/60 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-500"
                }
                shadow-[0_0_20px_rgba(0,122,255,0.5)]
              `}
            >
              {loading ? "Opening secure checkout…" : "Continue to payment →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
