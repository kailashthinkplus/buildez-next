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
      className="theme-toggle-button
        relative inline-flex h-9 w-9 items-center justify-center
        rounded-xl border border-slate-200/80 dark:border-white/10
        bg-[#f7fafa] text-slate-500
        backdrop-blur-xl
        shadow-none
        transition hover:-translate-y-0.5 hover:bg-white hover:text-amber-500
        dark:bg-white/[0.045] dark:text-slate-400 dark:hover:text-amber-300
        dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.28)]
      "
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <SunMedium
          className="h-[18px] w-[18px]"
        />
      ) : (
        <MoonStar
          className="h-[18px] w-[18px]"
        />
      )}
    </button>
  );
}
