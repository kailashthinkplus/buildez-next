"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthBodyBackground from "../AuthBodyBackground";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function verify() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          redirect: "/app/dashboard",
        }),
      });

      if (!res.ok) throw new Error("Invalid OTP");

      router.replace("/app/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthBodyBackground>
      <h1 className="text-xl font-semibold text-center mb-1">
        Verify OTP
      </h1>
      <p className="text-sm opacity-70 text-center mb-6">
        Enter the code sent to {email}
      </p>

      <input
        type="text"
        placeholder="6-digit code"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-full rounded-lg px-4 py-3 mb-4 border border-border bg-background text-center tracking-widest"
      />

      {error && (
        <p className="text-sm text-red-500 text-center mb-3">
          {error}
        </p>
      )}

      <button
        onClick={verify}
        disabled={otp.length < 6 || loading}
        className="w-full rounded-lg bg-[var(--brand)] py-3 font-semibold text-white"
      >
        {loading ? "Verifying..." : "Continue"}
      </button>
    </AuthBodyBackground>
  );
}
