"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useOnboarding } from "../OnboardingContext";
import OnboardingSidebar from "./OnboardingSidebar";
import ThemeToggle from "../../components/ThemeToggle";

export default function OnboardingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const user = {
    name: "Kailash Rao",
    avatarUrl: null,
  };

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

          {/* PROFILE DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="
                flex items-center gap-2 px-3 py-1.5
                rounded-xl hover:bg-black/5 dark:hover:bg-white/10
                transition
              "
            >
              {/* AVATAR */}
              <Image
                src={user.avatarUrl ?? "/default-avatar.svg"}
                alt="avatar"
                width={34}
                height={34}
                className="rounded-full object-cover"
              />

              {/* NAME */}
              <span className="hidden sm:block text-sm font-medium truncate max-w-[110px]">
                {user.name}
              </span>

{/* KEBAB MENU ICON */}
<svg
  width="16"
  height="16"
  viewBox="0 0 24 24"
  className="opacity-70 text-black dark:text-white"
  fill="currentColor"
>
  <circle cx="12" cy="5" r="1.8" />
  <circle cx="12" cy="12" r="1.8" />
  <circle cx="12" cy="19" r="1.8" />
</svg>

            </button>

            {/* DROPDOWN */}
            {profileOpen && (
              <div
                className="
                  absolute right-0 top-12 w-40 rounded-xl
                  glass p-2 shadow-xl backdrop-blur-xl z-50
                "
              >
                <button
                  className="
                    w-full text-left px-3 py-2 text-sm
                    hover:bg-black/5 dark:hover:bg-white/10
                    rounded-lg
                  "
                >
                  Logout
                </button>
              </div>
            )}
          </div>
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
              absolute top-0 left-0 w-[260px] h-full
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

            <OnboardingSidebar mobileMode />
          </div>
        </div>
      )}
    </>
  );
}
