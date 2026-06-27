"use client";

import { useTheme } from "next-themes";
import { MoonStar, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="
        relative inline-flex h-10 w-10 items-center justify-center
        rounded-full border border-blue-200/80 dark:border-white/10
        bg-white/85 text-blue-700
        backdrop-blur-xl
        shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_24px_rgba(29,78,216,0.16)]
        transition hover:scale-105 hover:bg-white
        dark:bg-slate-950/70 dark:text-amber-300
        dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_28px_rgba(0,0,0,0.36)]
      "
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <SunMedium
          className="h-5 w-5 drop-shadow-[0_0_10px_rgba(251,191,36,0.55)]"
          fill="currentColor"
        />
      ) : (
        <MoonStar
          className="h-5 w-5 drop-shadow-[0_0_10px_rgba(37,99,235,0.36)]"
          fill="currentColor"
        />
      )}
    </button>
  );
}
