"use client";

import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "../../app/components/ThemeToggle";
import { ShieldCheck } from "lucide-react";

export default function SuperAdminLoginPage() {
  function googleLogin() {
    window.location.href = "/api/auth/google";
  }

  return (
    <div className="auth-blue-bg relative min-h-screen w-full overflow-hidden text-foreground">
      <div className="fixed right-6 top-6 z-50">
        <ThemeToggle />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,149,255,0.3),transparent_65%)] opacity-80 blur-2xl" />

      <main className="relative flex min-h-screen items-center justify-center px-4 py-20">
        <div className="glass glass-hover relative w-full max-w-md rounded-2xl border border-white/40 bg-white/50 p-8 shadow-[0_28px_80px_rgba(37,99,235,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_32px_90px_rgba(0,0,0,0.5)]">
          <div className="mb-6 flex justify-center">
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

          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">
              <ShieldCheck size={14} /> Restricted access
            </span>
          </div>

          <h1 className="mb-1 text-center text-xl font-semibold">
            Sign in to the command center
          </h1>
          <p className="mb-6 text-center text-sm text-mutedForeground">
            BuildEZ Super Administrator access
          </p>

          <button
            onClick={googleLogin}
            className="glass glass-button flex h-12 w-full items-center justify-center gap-3 rounded-xl text-sm font-medium"
          >
            <Image src="/google.svg" alt="Google" width={18} height={18} />
            <span>Continue with Google</span>
          </button>
        </div>
      </main>

      <footer className="absolute inset-x-0 bottom-0 pb-6 text-center text-xs opacity-60">
        © {new Date().getFullYear()} BuildEZ ·
        <Link href="/terms" className="ml-1 hover:underline">Terms</Link>{" "}·
        <Link href="/privacy" className="ml-1 hover:underline">Privacy</Link>
      </footer>
    </div>
  );
}
