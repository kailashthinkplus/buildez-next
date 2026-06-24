"use client";

import React from "react";
import Image from "next/image";
import {
  User,
  Building2,
  CreditCard,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { useOnboarding } from "../OnboardingContext";

export default function OnboardingSidebar({
  activeStep,
  accountType,
  mobileMode = false,
  className = "",
}: {
  activeStep: number;
  accountType: string | null;
  mobileMode?: boolean;
  className?: string;
}) {
  const { setStep } = useOnboarding();

  const steps = [
    { label: "Account type", icon: User },
    {
      label:
        accountType === "business" ? "Business details" : "Profile details",
      icon: Building2,
    },
    { label: "Choose plan", icon: CreditCard },
    { label: "Domain & launch", icon: Globe },
    { label: "Finish", icon: CheckCircle2 },
  ];

  function onStepClick(index: number) {
    // ❗ Allow ONLY previous steps
    if (index < activeStep) {
      setStep(index);
    }
  }

  return (
    <aside
      className={`
        glass glass-flat
        w-[280px] shrink-0 border-r border-black/10 dark:border-white/10
        backdrop-blur-2xl
        bg-[rgba(230,240,255,0.7)]
        dark:bg-[rgba(10,18,36,0.6)]
        ${className}
      `}
    >
      {/* LOGO */}
      {!mobileMode && (
        <div className="px-6 pt-8 pb-10 hidden md:block">
          <Image
            src="/buildez-logo-light.svg"
            alt="BuildEZ"
            width={120}
            height={32}
            className="block dark:hidden"
          />
          <Image
            src="/buildez-logo-dark.svg"
            alt="BuildEZ"
            width={120}
            height={32}
            className="hidden dark:block"
          />
        </div>
      )}

      {/* MOBILE HEADER */}
      {mobileMode && (
        <div className="px-2 py-4">
          <Image
            src="/buildez-logo-light.svg"
            alt="BuildEZ"
            width={120}
            height={32}
            className="block dark:hidden"
          />
          <Image
            src="/buildez-logo-dark.svg"
            alt="BuildEZ"
            width={120}
            height={32}
            className="hidden dark:block"
          />
        </div>
      )}

      {/* STEP LIST */}
      <nav className="px-3 space-y-1">
        {steps.map((stepItem, index) => {
          const Icon = stepItem.icon;
          const isActive = index === activeStep;
          const isPast = index < activeStep;
          const isFuture = index > activeStep;

          return (
            <div
              key={stepItem.label}
              onClick={() => onStepClick(index)}
              className={`
                flex items-center gap-3 px-4 py-3 text-sm transition
                ${isActive &&
                  "rounded-[18px] bg-[rgba(47,125,246,0.25)] shadow-[inset_0_0_0_1px_rgba(47,125,246,0.45)]"}
                ${isPast &&
                  "cursor-pointer opacity-90 hover:bg-black/5 dark:hover:bg-white/5 rounded-[18px]"}
                ${isFuture && "opacity-40 cursor-not-allowed"}
              `}
            >
              <Icon size={18} />
              <span>{stepItem.label}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
