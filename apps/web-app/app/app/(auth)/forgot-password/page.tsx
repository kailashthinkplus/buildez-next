"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthSplitShell from "../AuthSplitShell";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [stage, setStage] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function requestCode(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Unable to send a code right now.");
      setNotice(`We sent a 6-digit code to ${email}. It expires in 10 minutes.`);
      setStage("reset");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to send a code right now.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Unable to reset your password.");
      router.replace(data?.redirect || "/app");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitShell
      eyebrow="Account recovery"
      title="Let's get you back in."
      description="Verify your email with a one-time code, then set a new password for your workspace."
    >
      <div className="auth-card">
        {stage === "email" ? (
          <>
            <h1>Reset your password</h1>
            <p className="auth-card-subtitle">Enter your email and we&apos;ll send you a verification code.</p>
            <form onSubmit={requestCode}>
              <div className="auth-field">
                <label htmlFor="forgot-email">Email address</label>
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              {error && <p className="auth-error" role="alert">{error}</p>}
              <button className="auth-submit" type="submit" disabled={!email || loading}>
                {loading ? "Sending code…" : "Send verification code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1>Enter your code</h1>
            <p className="auth-card-subtitle">{notice || `Enter the code sent to ${email}.`}</p>
            <form onSubmit={resetPassword}>
              <div className="auth-field">
                <label htmlFor="forgot-otp">Verification code</label>
                <input
                  id="forgot-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="6-digit code"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>
              <div className="auth-name-grid">
                <div className="auth-field">
                  <label htmlFor="forgot-password">New password</label>
                  <input
                    id="forgot-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    minLength={8}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="forgot-confirm">Confirm password</label>
                  <input
                    id="forgot-confirm"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </div>
              </div>
              {error && <p className="auth-error" role="alert">{error}</p>}
              <button className="auth-submit" type="submit" disabled={otp.length !== 6 || newPassword.length < 8 || !confirmPassword || loading}>
                {loading ? "Resetting…" : "Reset password"}
              </button>
              <p className="auth-switch">
                Didn&apos;t get a code?{" "}
                <button type="button" className="auth-text-button" onClick={() => setStage("email")}>Try a different email</button>
              </p>
            </form>
          </>
        )}
        <p className="auth-switch">Remembered your password? <a href="/app/login">Sign in</a></p>
      </div>
    </AuthSplitShell>
  );
}
