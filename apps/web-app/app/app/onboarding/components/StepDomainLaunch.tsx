"use client";

import { useEffect, useState } from "react";
import { Globe, Link as LinkIcon, Check } from "lucide-react";
import slugify from "slugify";

export default function StepDomainLaunch({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  /* -------------------------------------------------------------
     SERVER STATE (loaded from onboarding/status)
  ------------------------------------------------------------- */
  const [planCode, setPlanCode] = useState<string | null>(null);
  const [isFreePlan, setIsFreePlan] = useState(false);

  const [domain, setDomain] = useState(""); // input value
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const FREE_SUFFIX = "getbuildez.com";

  /* -------------------------------------------------------------
     Load status from backend exactly once
  ------------------------------------------------------------- */
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/onboarding/status");
      if (!res.ok) return;

      const data = await res.json();

      setPlanCode(data.planCode || null);

      const isFree = data.planCode === "trial";
      setIsFreePlan(isFree);

      if (!isFree && data.domain) {
        setDomain(data.domain);
        setAvailable(true);
      }
    })();
  }, []);

  /* -------------------------------------------------------------
     Domain availability check (paid plans only)
  ------------------------------------------------------------- */
  async function checkDomain() {
    if (!domain.trim() || isFreePlan) return;

    setChecking(true);
    setAvailable(null);
    setError(null);

    const res = await fetch("/api/onboarding/check-domain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });

    const json = await res.json();

    if (res.ok && json.available === true) {
      setAvailable(true);
      setError(null);
    } else {
      setAvailable(false);
      setError(json.error || "Domain unavailable");
    }

    setChecking(false);
  }

  /* -------------------------------------------------------------
     Continue → Save domain via backend
     - Free plan: force <slug>.getbuildez.com
     - Paid plan: require available=true
  ------------------------------------------------------------- */
  async function handleContinue() {
    let finalDomain = domain.trim().toLowerCase();

    if (isFreePlan) {
      const clean = slugify(domain || "mysite", { lower: true, strict: true });
      finalDomain = `${clean}.${FREE_SUFFIX}`;
    } else {
      if (!finalDomain || available !== true) return;
    }

    const res = await fetch("/api/onboarding/save-domain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: finalDomain }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "Failed to save domain");
      return;
    }

    onNext();
  }

  /* -------------------------------------------------------------
     ➤ SKIP DOMAIN (paid plan only)
     Saves "domain = null" and continues
  ------------------------------------------------------------- */
  async function handleSkip() {
    const res = await fetch("/api/onboarding/save-domain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: null }), // ⬅️ IMPORTANT
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "Could not skip domain");
      return;
    }

    onNext();
  }

  /* -------------------------------------------------------------
     RENDER
  ------------------------------------------------------------- */
  return (
    <div className="text-left max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-9 w-9 rounded-lg bg-blue-500/15 flex items-center justify-center">
          <Globe className="text-blue-400" size={16} />
        </div>
        <p className="text-xs font-medium tracking-wide text-blue-400">
          Domain Setup
        </p>
      </div>

      <h2 className="text-2xl font-semibold mb-2">
        Choose your website domain
      </h2>

      <p className="text-sm text-white/65 mb-10">
        {isFreePlan
          ? "Free plan uses a BuildEZ subdomain — you can upgrade anytime."
          : "Enter a custom domain or skip this step for now."}
      </p>

      <div className="glass p-6 rounded-2xl mb-10">
        {/* FREE PLAN UI (unchanged) */}
        {isFreePlan && (
          <div>
            <label className="text-xs text-white/60 block mb-2">
              Enter your site name
            </label>

            <input
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setAvailable(null);
              }}
              placeholder="my-brand"
              className="glass p-4 rounded-xl w-full text-sm border border-white/10 focus:border-blue-400/40"
            />

            {domain && (
              <p className="text-xs mt-3 text-white/60">
                Your site will be:
                <span className="text-blue-300 ml-1">
                  {slugify(domain, { lower: true, strict: true })}.{FREE_SUFFIX}
                </span>
              </p>
            )}
          </div>
        )}

        {/* PAID PLAN UI */}
        {!isFreePlan && (
          <div>
            <label className="text-xs text-white/60 block mb-2">
              Enter your desired domain
            </label>

            <div className="relative">
              <LinkIcon
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value.toLowerCase());
                  setAvailable(null);
                  setError(null);
                }}
                placeholder="yourbrand.com"
                className="glass p-4 pl-10 rounded-xl w-full text-sm border border-white/10 focus:border-blue-400/40"
              />
            </div>

            <button
              onClick={checkDomain}
              disabled={!domain.trim() || checking}
              className="mt-4 px-6 py-2 glass rounded-xl text-sm"
            >
              {checking ? "Checking…" : "Check Domain"}
            </button>

            {available && !checking && (
              <p className="text-green-400 text-sm mt-3 flex items-center gap-1">
                <Check size={14} /> Domain is available
              </p>
            )}

            {available === false && !checking && (
              <p className="text-red-400 text-sm mt-3">{error}</p>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="glass px-6 py-2.5 rounded-xl text-xs">
          ← Back
        </button>

        <div className="flex items-center gap-3">
          {/* SKIP BUTTON — only for paid plans */}
          {!isFreePlan && (
            <button
              onClick={handleSkip}
              className="px-6 py-2.5 rounded-xl text-xs bg-white/10 hover:bg-white/20 transition"
            >
              Skip
            </button>
          )}

          {/* CONTINUE */}
          <button
            onClick={handleContinue}
            disabled={!isFreePlan && available !== true}
            className={`
              px-6 py-2.5 rounded-xl text-xs font-medium text-white transition
              ${
                isFreePlan
                  ? "bg-blue-600 hover:bg-blue-500"
                  : available
                  ? "bg-blue-600 hover:bg-blue-500"
                  : "bg-blue-600/40 cursor-not-allowed"
              }
            `}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
