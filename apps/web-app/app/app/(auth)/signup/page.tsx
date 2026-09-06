"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthSplitShell from "../AuthSplitShell";

type AccountKind = "personal" | "business";

export default function SignupPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountKind>("personal");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signup(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ accountType, firstName, lastName, businessName: accountType === "business" ? businessName : undefined, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to create your account");
      router.replace("/app/onboarding");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  const formReady = Boolean(firstName && lastName && email && password.length >= 8 && confirmPassword && accepted && (accountType === "personal" || businessName));

  return (
    <AuthSplitShell eyebrow="Start building" title="One account. Every ambition." description="Create for yourself or open a workspace for your business. Build Ezy adapts from the first step.">
      <div className="auth-card">
        <h1>Create your Build Ezy account</h1>
        <p className="auth-card-subtitle">Choose how you’re building today. You can grow later.</p>
        <div className="auth-tabs" role="tablist" aria-label="Account type"><button className={`auth-tab${accountType === "personal" ? " active" : ""}`} type="button" role="tab" aria-selected={accountType === "personal"} onClick={() => setAccountType("personal")}>Individual</button><button className={`auth-tab${accountType === "business" ? " active" : ""}`} type="button" role="tab" aria-selected={accountType === "business"} onClick={() => setAccountType("business")}>Business</button></div>
        <button className="auth-google" type="button" onClick={() => { window.location.href = "/api/auth/google"; }}><Image src="/google.svg" alt="" width={18} height={18} /><span>Continue with Google</span></button>
        <div className="auth-divider">OR</div>
        <form onSubmit={signup}>
          <div className="auth-name-grid"><div className="auth-field"><label htmlFor="signup-first">First name</label><input id="signup-first" autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} required /></div><div className="auth-field"><label htmlFor="signup-last">Last name</label><input id="signup-last" autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} required /></div></div>
          {accountType === "business" && <div className="auth-field"><label htmlFor="signup-business">Business name</label><input id="signup-business" autoComplete="organization" placeholder="Your company or studio" value={businessName} onChange={(event) => setBusinessName(event.target.value)} required /></div>}
          <div className="auth-field"><label htmlFor="signup-email">Email address</label><input id="signup-email" type="email" autoComplete="email" placeholder={accountType === "business" ? "you@company.com" : "you@example.com"} value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          <div className="auth-name-grid"><div className="auth-field"><label htmlFor="signup-password">Password</label><input id="signup-password" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></div><div className="auth-field"><label htmlFor="signup-confirm">Confirm password</label><input id="signup-confirm" type="password" autoComplete="new-password" placeholder="Repeat password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required /></div></div>
          <label className="auth-terms"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} required /><span>I agree to the <Link href="/terms">Terms &amp; Conditions</Link> and <Link href="/privacy">Privacy Policy</Link>.</span></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={!formReady || loading}>{loading ? "Creating account…" : accountType === "business" ? "Create business workspace" : "Create individual account"}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link href="/app/login">Sign in</Link></p>
      </div>
    </AuthSplitShell>
  );
}
