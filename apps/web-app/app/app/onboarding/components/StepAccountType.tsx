"use client";

import {
  User,
  Building2,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { useOnboarding } from "../OnboardingContext";
import { useState } from "react";

export default function StepAccountType({
  onNext,
}: {
  onNext: () => void;
}) {
  const { accountType, setAccountType } = useOnboarding();
  const [saving, setSaving] = useState(false);

  async function saveAndContinue() {
    if (!accountType) return;

    setSaving(true);

    // ✅ FIXED: Correct onboarding API endpoint
    await fetch("/api/onboarding/account-type", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountType,
      }),
    });

    setSaving(false);
    onNext();
  }

  const isPersonal = accountType === "personal";
  const isBusiness = accountType === "business";

  /* Card styling */
  const baseCard =
    "glass glass-hover p-7 text-left transition-all rounded-2xl border backdrop-blur-xl";

  const selectedCard =
    "border-blue-500 bg-white/70 dark:bg-[rgba(59,130,246,0.12)] shadow-[0_0_0_1px_rgba(59,130,246,0.6)]";

  const unselectedCard =
    "border-black/10 dark:border-white/10 hover:border-blue-400/40 bg-white dark:bg-white/5";

  return (
    <div className="max-w-5xl mx-auto text-left text-slate-900 dark:text-white">
      {/* TOP BADGE */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-9 w-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
          <Sparkles className="text-blue-500 dark:text-blue-400" size={18} />
        </div>
        <p className="text-s font-medium tracking-wide text-blue-600 dark:text-blue-400">
          Personalisation
        </p>
      </div>

      {/* TITLE */}
      <h2 className="text-2xl font-semibold leading-snug mb-3 text-slate-900 dark:text-white">
        How are you planning to use BuildEZ?
      </h2>

      {/* SUBTITLE */}
      <p className="text-sm text-slate-600 dark:text-white/65 max-w-3xl mb-10">
        This helps us tailor AI layouts, content tone, features, and
        recommendations — so your site feels like it was designed just for you.
      </p>

      {/* OPTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* PERSONAL */}
        <button
          type="button"
          onClick={() => setAccountType("personal")}
          className={`${baseCard} ${
            isPersonal ? selectedCard : unselectedCard
          }`}
        >
          <div
            className="
              h-11 w-11 rounded-xl 
              bg-blue-500/10 dark:bg-blue-500/15 
              flex items-center justify-center mb-5
            "
          >
            <User className="text-blue-600 dark:text-blue-400" size={18} />
          </div>

          <h3 className="text-base font-medium mb-1 text-slate-900 dark:text-white">
            Personal
          </h3>
          <p className="text-xs text-slate-700 dark:text-white/60 leading-relaxed">
            Freelancers, creators, consultants, portfolios, and personal brands.
          </p>
        </button>

        {/* BUSINESS */}
        <button
          type="button"
          onClick={() => setAccountType("business")}
          className={`${baseCard} ${
            isBusiness ? selectedCard : unselectedCard
          }`}
        >
          <div
            className="
              h-11 w-11 rounded-xl
              bg-blue-500/10 dark:bg-blue-500/15
              flex items-center justify-center mb-5
            "
          >
            <Building2
              className="text-blue-600 dark:text-blue-400"
              size={18}
            />
          </div>

          <h3 className="text-base font-medium mb-1 text-slate-900 dark:text-white">
            Business
          </h3>
          <p className="text-xs text-slate-700 dark:text-white/60 leading-relaxed">
            Companies, startups, agencies, and registered organisations.
          </p>
        </button>
      </div>

      {/* HELPER NOTE */}
      <div className="glass px-5 py-3 rounded-xl text-[13px] text-slate-600 dark:text-white/60 mb-8">
        <div className="flex items-start gap-2">
          <Lightbulb
            size={14}
            className="mt-[1px] text-blue-500/80 dark:text-blue-400/80 shrink-0"
          />
          <span>
            You can change this later. We use it only to optimise AI suggestions —
            not for billing or restrictions.
          </span>
        </div>
      </div>

      {/* ACTION */}
      <div className="flex justify-end">
        <button
          onClick={saveAndContinue}
          disabled={!accountType || saving}
          className={`
            px-6 py-2.5 rounded-xl text-xs border-18 font-medium transition
            text-white
            ${
              accountType
                ? "bg-blue-600 hover:bg-blue-500"
                : "bg-blue-600/40 border-18 cursor-not-allowed"
            }
          `}
        >
          {saving ? "Saving…" : "Next →"}
        </button>
      </div>
    </div>
  );
}
