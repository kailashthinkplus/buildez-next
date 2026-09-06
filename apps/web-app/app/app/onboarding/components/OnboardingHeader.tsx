"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useOnboarding } from "../OnboardingContext";
import OnboardingSidebar from "./OnboardingSidebar";
import ThemeToggle from "../../components/ThemeToggle";
import AccountMenu from "../../components/AccountMenu";

export default function OnboardingHeader() {
  const { step, accountType } = useOnboarding();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* HEADER */}
      <header
        className="
          relative z-40
          border-b border-black/10 dark:border-white/10
          backdrop-blur-xl
          bg-[rgba(255,255,255,0.6)] dark:bg-white/5

          h-16 flex items-center justify-between
          px-4 md:px-8
        "
      >
        {/* LEFT SIDE — MOBILE LOGO + MENU */}
        <div className="flex items-center gap-3">
          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>

          {/* MOBILE LOGO */}
          <div className="md:hidden">
            <Image
              src="/buildez-logo-light.svg"
              alt="BuildEZ"
              width={110}
              height={28}
              className="block dark:hidden"
            />
            <Image
              src="/buildez-logo-dark.svg"
              alt="BuildEZ"
              width={110}
              height={28}
              className="hidden dark:block"
            />
          </div>

          {/* DESKTOP TITLE */}
          <div className="hidden md:block">
            <p className="text-xs uppercase tracking-widest opacity-60">
              Getting started
            </p>
            <h1 className="text-lg font-medium leading-tight">
              Let’s personalise your BuildEZ experience
            </h1>
          </div>
        </div>

        {/* RIGHT SIDE — THEME TOGGLE → AVATAR → KEBAB */}
        <div className="flex items-center gap-5">

          {/* ⭐ SLightly nudged LEFT */}
          <div className="flex items-center mr-2 md:mr-3">
            <ThemeToggle />
          </div>

          <AccountMenu showWorkspace={false} />
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* PANEL */}
          <div
            className="
              absolute top-0 left-0 w-[280px] h-full
              bg-[rgba(255,255,255,0.95)]
              dark:bg-[rgba(10,18,36,0.95)]
              backdrop-blur-2xl
              border-r border-black/10 dark:border-white/10
              shadow-xl p-6 flex flex-col z-[70]
            "
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="self-end mb-6 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X size={22} />
            </button>

            <OnboardingSidebar activeStep={step} accountType={accountType} mobileMode className="flex-1 min-h-0 overflow-y-auto" />
          </div>
        </div>
      )}
    </>
  );
}
