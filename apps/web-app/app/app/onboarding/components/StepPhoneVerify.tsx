"use client";

import { useEffect, useRef, useState } from "react";
import { Smartphone, ShieldCheck } from "lucide-react";
import { useOnboarding } from "../OnboardingContext";
import { firebasePhoneAuthEnabled, getFirebaseAuth } from "@/lib/firebase/client";
import type { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";

export default function StepPhoneVerify({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { phoneVerificationConfigured } = useOnboarding();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  useEffect(() => {
    return () => {
      recaptchaRef.current?.clear();
    };
  }, []);

  const phoneValid = /^\+[1-9]\d{7,14}$/.test(phone.trim());

  async function sendCode() {
    if (!phoneValid) {
      setError("Enter your number in international format, e.g. +14155551234.");
      return;
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      setError("Phone verification isn't configured yet.");
      return;
    }
    setError("");
    setSending(true);
    try {
      const { RecaptchaVerifier, signInWithPhoneNumber } = await import("firebase/auth");
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, "phone-verify-recaptcha", { size: "invisible" });
      }
      confirmationRef.current = await signInWithPhoneNumber(auth, phone.trim(), recaptchaRef.current);
      setStage("code");
    } catch (err: unknown) {
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
      const code = typeof err === "object" && err && "code" in err ? String(err.code) : "";
      if (code.includes("too-many-requests")) setError("Too many attempts. Please wait a few minutes and try again.");
      else if (code.includes("invalid-phone-number")) setError("Enter a valid mobile number with its country code.");
      else if (code.includes("captcha") || code.includes("app-credential")) setError("The security check could not be completed. Refresh the page and try again.");
      else setError("We couldn't send the verification code. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function verifyCode() {
    if (!confirmationRef.current || code.length < 6) return;
    setError("");
    setVerifying(true);
    try {
      const credential = await confirmationRef.current.confirm(code);
      const idToken = await credential.user.getIdToken();
      const res = await fetch("/api/onboarding/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "That code didn't match.");
      onNext();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "That code didn't match.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto text-left text-slate-900 dark:text-white">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-9 w-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
          <Smartphone className="text-blue-500 dark:text-blue-400" size={18} />
        </div>
        <p className="text-xs font-medium tracking-wide text-blue-600 dark:text-blue-400">
          Phone verification
        </p>
      </div>

      <h2 className="text-2xl font-semibold leading-snug mb-3 text-slate-900 dark:text-white">
        Verify your mobile number
      </h2>
      <p className="text-sm text-slate-600 dark:text-white/65 max-w-3xl mb-10">
        This secures your account and lets us reach you about your website. We&apos;ll text a one-time code — standard rates may apply.
      </p>

      {!firebasePhoneAuthEnabled || !phoneVerificationConfigured ? (
        <div className="glass px-5 py-4 rounded-xl text-sm text-slate-600 dark:text-white/65 mb-8">
          Phone verification is temporarily unavailable. Refresh the page or contact support if this continues.
        </div>
      ) : stage === "phone" ? (
        <div className="max-w-sm mb-8">
          <label className="block text-xs font-medium text-slate-600 dark:text-white/60 mb-2">Mobile number</label>
          <input
            className="glass p-4 rounded-xl text-sm w-full"
            placeholder="+14155551234"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
          <p className="text-xs text-slate-500 dark:text-white/45 mt-2">Include your country code, e.g. +91 for India.</p>
        </div>
      ) : (
        <div className="max-w-sm mb-8">
          <label className="block text-xs font-medium text-slate-600 dark:text-white/60 mb-2">6-digit code</label>
          <input
            className="glass p-4 rounded-xl text-sm w-full tracking-[0.3em] text-center"
            placeholder="123456"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
          <button type="button" className="text-xs text-blue-600 dark:text-blue-400 mt-2" onClick={() => { setStage("phone"); setCode(""); setError(""); }}>
            Use a different number
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-500 mb-6">{error}</p>}

      <div id="phone-verify-recaptcha" />

      <div className="glass px-5 py-3 rounded-xl text-[13px] text-slate-600 dark:text-white/60 mb-8">
        <div className="flex items-start gap-2">
          <ShieldCheck size={14} className="mt-[1px] text-blue-500/80 dark:text-blue-400/80 shrink-0" />
          <span>Your number is only used for account security and important updates — never shared or sold.</span>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="glass px-6 py-2.5 rounded-xl text-xs">← Back</button>

        {!firebasePhoneAuthEnabled || !phoneVerificationConfigured ? (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-medium text-white transition hover:bg-blue-500"
          >
            Refresh
          </button>
        ) : stage === "phone" ? (
          <button
            type="button"
            onClick={sendCode}
            disabled={!phoneValid || sending}
            className={`px-6 py-2.5 rounded-xl text-xs font-medium transition text-white ${!phoneValid || sending ? "bg-blue-600/40 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"}`}
          >
            {sending ? "Sending code…" : "Send code"}
          </button>
        ) : (
          <button
            type="button"
            onClick={verifyCode}
            disabled={code.length !== 6 || verifying}
            className={`px-6 py-2.5 rounded-xl text-xs font-medium transition text-white ${code.length !== 6 || verifying ? "bg-blue-600/40 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"}`}
          >
            {verifying ? "Verifying…" : "Verify & continue →"}
          </button>
        )}
      </div>
    </div>
  );
}
