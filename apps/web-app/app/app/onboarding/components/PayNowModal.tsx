"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, AlertTriangle, RotateCcw } from "lucide-react";

export default function PayNowModal({
  open = false,
  onClose = () => {},
  plan = "",
  billing = "monthly",
  price = 0,
  features = [],
  onPayNow = async () => {},
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        onClose(data);
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

      // Begin Razorpay flow
      const result = await Promise.resolve().then(() => onPayNow());

      // Razorpay UI opens → modal should keep showing loading
      if (!result) console.log("⚠️ PayNowModal: onPayNow returned no result");
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
            onClick={() => onClose({ success: false })}
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
              onClick={() => onClose({ success: false })}
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

              <p className="text-4xl font-bold mt-2 drop-shadow-sm">
                ₹{(price ?? 0).toLocaleString()}
                <span className="text-white/60 text-sm ml-1">
                  / {billing === "monthly" ? "month" : "year"}
                </span>
              </p>
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

            {/* ERROR FROM RAZORPAY FLOW */}
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
              {loading ? "Processing…" : "Proceed to Pay →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
