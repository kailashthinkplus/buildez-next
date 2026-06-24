"use client";

import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function OnboardingHeader() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    document.documentElement.classList.toggle("dark");
    setDark(document.documentElement.classList.contains("dark"));
  };

  return (
    <header className="h-16 px-8 flex items-center justify-between border-b border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl">
      <div>
        <p className="text-xs opacity-60">Getting started</p>
        <p className="text-sm font-medium">
          Let’s personalise your BuildEZ experience
        </p>
      </div>

      <button
        onClick={toggle}
        className="h-9 w-9 rounded-lg flex items-center justify-center border border-black/5 dark:border-white/10"
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  );
}
