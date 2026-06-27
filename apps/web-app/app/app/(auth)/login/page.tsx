"use client";

import Image from "next/image";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* LOGIN */
  async function login() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          role: "TENANT_ADMIN",
          source: "tenant_login",
          remember,
          redirect: "/app",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Unauthorized");
      }

      router.replace("/app");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  /* GOOGLE LOGIN */
  function googleLogin() {
    const state = encodeURIComponent(
      JSON.stringify({
        role: "TENANT_ADMIN",
        redirect: "/app",
      })
    );
    window.location.href = `/api/auth/google?state=${state}`;
  }

  return (
    <div className="auth-blue-bg relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Blue ambient glow in both modes */}
      <div
        className="
          absolute inset-0
          bg-[radial-gradient(circle_at_30%_20%,rgba(56,149,255,0.3),transparent_65%)]
          opacity-80
          blur-2xl
          pointer-events-none
        "
      />

      {/* LOGIN CARD — polished dark-mode glass */}
      <div
        className="
          relative w-full max-w-md
          glass glass-hover p-8 rounded-2xl
          bg-white/50 border border-white/40 backdrop-blur-2xl
          dark:bg-white/5 dark:border-white/10
          shadow-[0_28px_80px_rgba(37,99,235,0.18)]
          dark:shadow-[0_32px_90px_rgba(0,0,0,0.5)]
        "
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/buildez-logo-light.svg"
            alt="BuildEZ"
            width={150}
            height={42}
            priority
            className="dark:hidden"
          />
          <Image
            src="/buildez-logo-dark.svg"
            alt="BuildEZ"
            width={150}
            height={42}
            priority
            className="hidden dark:block"
          />
        </div>

        {/* Heading */}
        <h1 className="text-xl font-semibold text-center mb-1">
          Sign in to your workspace
        </h1>
        <p className="text-sm text-mutedForeground text-center mb-6">
          Tenant / Workspace Admin access
        </p>

        {/* Google account not found */}
        {errorParam === "account_not_found" && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center">
            <p className="text-sm font-semibold text-red-600">
              No workspace found
            </p>
            <p className="mt-1 text-sm opacity-80">
              This Google account isn't linked to any BuildEZ workspace.
            </p>
            <button
              onClick={() => router.push("/app/signup")}
              className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Create your workspace
            </button>
          </div>
        )}

        {/* Google Login */}
        <button
          onClick={googleLogin}
          className="
            w-full h-12 mb-6 rounded-xl
            glass glass-button
            flex items-center justify-center gap-3
            text-sm font-medium
          "
        >
          <Image src="/google.svg" alt="Google" width={18} height={18} />
          <span>Continue with Google</span>
        </button>

        {/* OR Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 bg-black/20 dark:bg-white/30 rounded-full" />
          <span className="text-xs opacity-60">OR</span>
          <div className="h-px flex-1 bg-black/20 dark:bg-white/30 rounded-full" />
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="admin@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="
            w-full rounded-xl px-4 py-3 mb-4
            bg-white/60 border border-black/10
            backdrop-blur-sm
            text-black placeholder-black/40
            shadow-sm
            focus:outline-none focus:ring-2 focus:ring-[var(--brand)]

            dark:bg-white/5 dark:text-white dark:placeholder-white/40
            dark:border-white/10
            dark:focus:ring-[var(--brand)]
          "
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="
            w-full rounded-xl px-4 py-3 mb-4
            bg-white/60 border border-black/10
            backdrop-blur-sm
            text-black placeholder-black/40
            shadow-sm
            focus:outline-none focus:ring-2 focus:ring-[var(--brand)]

            dark:bg-white/5 dark:text-white dark:placeholder-white/40
            dark:border-white/10
            dark:focus:ring-[var(--brand)]
          "
        />

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 text-center mb-3">{error}</p>
        )}

        {/* Remember */}
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={remember}
            onChange={() => setRemember(!remember)}
            className="rounded-md"
          />
          <span className="text-sm opacity-70">Remember me</span>
        </label>

        {/* Submit */}
        <button
          onClick={login}
          disabled={!email || !password || loading}
          className="
            w-full rounded-xl bg-[var(--brand)]
            py-3 font-semibold text-white
            hover:brightness-110
            disabled:opacity-50
          "
        >
          {loading ? "Signing in..." : "Continue"}
        </button>

        {/* Actions */}
        <div className="flex justify-between mt-6 text-sm">
          <button
            onClick={() => router.push("/app/signup")}
            className="text-primary hover:underline"
          >
            Create account
          </button>
          <button
            onClick={() => router.push("/app/forgot-password")}
            className="opacity-70 hover:underline"
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TenantLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
