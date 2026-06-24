"use client";

import { useState } from "react";
import { X, ShieldCheck, Loader2 } from "lucide-react";

export default function StarterTrialMandateModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [mandateId, setMandateId] = useState(null);

  if (!open) return null;

  async function startTrialFlow() {
    try {
      setLoading(true);

      // 1. Create Razorpay customer
      const customerRes = await fetch("/api/onboarding/trial/create-customer", {
        method: "POST",
        body: JSON.stringify({
          name: "User",
          email: "user@example.com",
          phone: "9999999999",
        }),
      });

      const customer = await customerRes.json();
      console.log("📦 customer:", customer);

      if (!customer.customerId) {
        alert("Failed to create customer");
        return;
      }
      setCustomerId(customer.customerId);

      // 2. Create mandate (₹1 charge auth)
      const mandateRes = await fetch("/api/onboarding/trial/create-mandate", {
        method: "POST",
        body: JSON.stringify({
          customerId: customer.customerId,
          method: "card",
        }),
      });

      const mandate = await mandateRes.json();
      console.log("💳 mandate:", mandate);

      if (!mandate.mandateId) {
        alert("Failed to create mandate");
        return;
      }
      setMandateId(mandate.mandateId);

      // 3. Auto-verify token (simulate)
      const verifyRes = await fetch("/api/onboarding/trial/verify", {
        method: "POST",
        body: JSON.stringify({
          customerId: customer.customerId,
          tokenId: mandate.mandateId,
        }),
      });

      const verify = await verifyRes.json();
      console.log("🔐 verify:", verify);

      if (verify.success) {
        window.location.href = "/app/dashboard";
      } else {
        alert("Mandate verification failed");
      }
    } catch (err) {
      console.error("🔥 StarterTrial Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        fixed inset-0 z-[200]
        flex items-center justify-center
        bg-black/40 backdrop-blur-lg
      "
    >
      <div
        className="
          relative w-full max-w-md p-8 rounded-2xl
          bg-white/10 dark:bg-white/10
          backdrop-blur-2xl border border-white/15
          shadow-[0_20px_70px_-10px_rgba(0,0,0,0.45)]
        "
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/10 transition"
        >
          <X className="h-5 w-5 text-white/70" />
        </button>

        <h2 className="text-center text-xl font-semibold text-white mb-4">
          Start Your Free 30-Day Trial
        </h2>

        <p className="text-center text-white/60 text-sm mb-6">
          Save a valid payment method to begin your trial.  
          <br />₹1 will be authorized & refunded automatically.
        </p>

        <button
          onClick={startTrialFlow}
          disabled={loading}
          className="
            w-full py-3 rounded-xl
            flex items-center justify-center gap-2
            bg-green-600 hover:bg-green-500
            text-white font-medium
            shadow-[0_0_15px_rgba(34,197,94,0.3)]
          "
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <>
              <ShieldCheck className="h-5 w-5" />
              Save Card & Start Trial
            </>
          )}
        </button>
      </div>
    </div>
  );
}
