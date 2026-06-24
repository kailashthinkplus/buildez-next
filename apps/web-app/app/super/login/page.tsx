"use client";

import Image from "next/image";
import ThemeToggle from "../../app/components/ThemeToggle";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SuperAdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------------------------------------
     SEND OTP (SUPER ADMIN ONLY)
  --------------------------------------------- */
  async function sendOtp() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/super/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to send OTP");
      }

      setStep("OTP");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------
     VERIFY OTP (SUPER ADMIN ONLY)
  --------------------------------------------- */
  async function verifyOtp() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/super/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Unauthorized");
      }

      router.replace(data.redirect || "/super/dashboard");
    } catch (err: any) {
      setError(err.message || "Unauthorized super admin access");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md glass glass-hover p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/buildez-logo-dark.png"
              alt="BuildEZ"
              width={150}
              height={42}
              priority
              className="dark:hidden"
            />
            <Image
              src="/buildez-logo-light.png"
              alt="BuildEZ"
              width={150}
              height={42}
              priority
              className="hidden dark:block"
            />
          </div>

          {/* Title */}
          <h1 className="text-xl font-semibold text-center mb-1">
            Super Admin Login
          </h1>
          <p className="text-sm text-mutedForeground text-center mb-6">
            Restricted platform access
          </p>

          {/* STEP: EMAIL */}
          {step === "EMAIL" && (
            <>
              <input
                type="email"
                placeholder="admin@buildez.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  w-full rounded-lg px-4 py-3 mb-4
                  border border-border bg-background
                  focus:outline-none
                  focus:ring-2 focus:ring-[var(--brand)]
                "
              />

              {error && (
                <p className="text-sm text-red-500 text-center mb-3">
                  {error}
                </p>
              )}

              <button
                onClick={sendOtp}
                disabled={!email || loading}
                className="
                  w-full rounded-lg
                  bg-[var(--brand)]
                  py-3 font-semibold text-white
                  hover:brightness-110
                  disabled:opacity-50
                "
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          )}

          {/* STEP: OTP */}
          {step === "OTP" && (
            <>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="
                  w-full rounded-lg px-4 py-3 mb-4
                  text-center tracking-widest
                  border border-border bg-background
                  focus:outline-none
                  focus:ring-2 focus:ring-[var(--brand)]
                "
              />

              {error && (
                <p className="text-sm text-red-500 text-center mb-3">
                  {error}
                </p>
              )}

              <button
                onClick={verifyOtp}
                disabled={otp.length !== 6 || loading}
                className="
                  w-full rounded-lg
                  bg-[var(--brand)]
                  py-3 font-semibold text-white
                  hover:brightness-110
                  disabled:opacity-50
                "
              >
                {loading ? "Verifying..." : "Login"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="pb-6 text-center text-xs opacity-60">
        © {new Date().getFullYear()} BuildEZ ·
        <a href="/terms" className="ml-1 hover:underline">
          Terms
        </a>{" "}
        ·
        <a href="/privacy" className="ml-1 hover:underline">
          Privacy
        </a>
      </footer>
    </div>
  );
}
