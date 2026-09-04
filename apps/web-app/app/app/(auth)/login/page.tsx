"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthSplitShell from "../AuthSplitShell";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, remember }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Unable to sign in");
      }
      router.replace("/app");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitShell eyebrow="Welcome back" title="Your next great website is waiting." description="Return to the workspace where your pages, customers, commerce, and insights stay connected.">
      <div className="auth-card">
        <h1>Sign in to your workspace</h1>
        <p className="auth-card-subtitle">Continue building, publishing, and growing.</p>
        {errorParam === "account_not_found" && <div className="auth-inline-notice">No workspace is connected to that Google account. <button className="auth-text-button" onClick={() => router.push("/app/signup")}>Create one now</button>.</div>}
        <button className="auth-google" type="button" onClick={() => { window.location.href = "/api/auth/google"; }}><Image src="/google.svg" alt="" width={18} height={18} /><span>Continue with Google</span></button>
        <div className="auth-divider">OR</div>
        <form onSubmit={login}>
          <div className="auth-field"><label htmlFor="login-email">Email address</label><input id="login-email" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          <div className="auth-field"><label htmlFor="login-password">Password</label><input id="login-password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <div className="auth-options"><label><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me</label><button type="button" className="auth-text-button" onClick={() => router.push("/app/forgot-password")}>Forgot password?</button></div>
          <button className="auth-submit" type="submit" disabled={!email || !password || loading}>{loading ? "Signing in…" : "Sign in"}</button>
        </form>
        <p className="auth-switch">New to Build Ezy? <a href="/app/signup">Create an account</a></p>
      </div>
    </AuthSplitShell>
  );
}

export default function TenantLoginPage() {
  return <Suspense fallback={<div className="auth-blue-bg min-h-screen" />}><LoginForm /></Suspense>;
}
