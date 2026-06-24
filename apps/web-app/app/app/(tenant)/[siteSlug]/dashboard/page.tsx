"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Mic,
  Search,
  Zap,
  Inbox,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

/* ============================================================
   SITE DASHBOARD
   /app/[siteSlug]/dashboard
============================================================ */

export default function SiteDashboardPage() {
  const { siteSlug } = useParams<{ siteSlug: string }>();

  /* -----------------------------------------
     AI PROMPT STATE
  ----------------------------------------- */

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [userTyped, setUserTyped] = useState(false);
  const [loopIndex, setLoopIndex] = useState(0);

  useEffect(() => setMounted(true), []);

  const placeholderTexts = [
    "a modern company website with clean sections, SEO copy, and premium visuals…",
    "an elegant landing page with storytelling, feature blocks, and a conversion-focused CTA…",
    "a clean portfolio layout showcasing projects, testimonials, and a contact form…",
    "a startup launch page with bold messaging, social proof, and early-access signup…",
  ];

  useEffect(() => {
    if (!mounted) return;
    if (!textareaRef.current) return;
    if (userTyped || textareaRef.current.value?.length) return;

    const text = placeholderTexts[loopIndex];
    let i = 0;
    setTypedText("");

    const interval = setInterval(() => {
      setTypedText(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        setTimeout(
          () => setLoopIndex((p) => (p + 1) % placeholderTexts.length),
          1200
        );
      }
    }, 40);

    return () => clearInterval(interval);
  }, [mounted, loopIndex, userTyped]);

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div
      className="
        flex flex-col flex-1 h-full
        bg-gradient-to-b from-[#F8FAFF] to-[#EEF3FF]
        dark:bg-gradient-to-b dark:from-[#0B0F1A]/0 dark:to-[#0E1320]/0
      "
    >
      <div className="w-full overflow-y-auto pb-24">

        {/* ================================================= */}
        {/* HEADER / AI PROMPT                                */}
        {/* ================================================= */}

        <section className="px-4 sm:px-6 md:px-10 pt-16 pb-20">
          <div className="mx-auto max-w-5xl text-center">

            <p className="mb-3 text-xs uppercase tracking-wide opacity-60">
              Site dashboard · {siteSlug}
            </p>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Build & grow your{" "}
              <span className="text-blue-600 dark:text-blue-400">
                website
              </span>{" "}
              with AI
            </h1>

            <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-white/70">
              Generate pages, sections, and content tailored to this site.
            </p>

            {/* AI PROMPT BOX */}
            <div className="relative mx-auto mt-10 max-w-3xl rounded-2xl bg-white/80 dark:bg-white/[0.06] border border-gray-300 dark:border-white/20 shadow-xl">
              <div className="relative flex items-center gap-4 px-6 py-6">

                <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs bg-gray-200 dark:bg-white text-black">
                  <Globe className="h-3.5 w-3.5" />
                  Web
                </span>

                {mounted && !userTyped && !textareaRef.current?.value && (
                  <div className="absolute left-[7rem] top-[2.6rem] text-xs sm:text-sm text-gray-400 dark:text-white/50 pointer-events-none">
                    {typedText}
                    <span className="ml-1 animate-pulse">|</span>
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  onChange={(e) => setUserTyped(e.target.value.length > 0)}
                  rows={3}
                  className="w-full resize-none bg-transparent text-sm text-gray-900 dark:text-white outline-none pt-2"
                />

                <button className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-500">
                  <ArrowRight className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* KPIs (SITE LEVEL)                                 */}
        {/* ================================================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6">

          <KpiCard
            icon={Globe}
            label="Published Pages"
            value="—"
          />

          <KpiCard
            icon={Search}
            label="Monthly Visitors"
            value="—"
          />

          <KpiCard
            icon={Inbox}
            label="Form Submissions"
            value="—"
          />

          <KpiCard
            icon={Zap}
            label="AI Generations"
            value="—"
          />

        </section>

        {/* ================================================= */}
        {/* QUICK ACTIONS                                     */}
        {/* ================================================= */}

        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 px-6">

          <QuickAction
            title="Create new page"
            href={`/app/${siteSlug}/pages`}
            icon={ArrowRight}
          />

          <QuickAction
            title="Open page builder"
            href={`/app/${siteSlug}/pages`}
            icon={Search}
          />

          <QuickAction
            title="Connect domain"
            href={`/app/${siteSlug}/domains`}
            icon={Globe}
          />

        </section>
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="relative rounded-2xl p-5 bg-gradient-to-br from-[#1E2C47] to-[#273948] border border-white/10 shadow-lg shadow-black/40 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 border border-white/15">
          <Icon className="h-5 w-5 text-white/80" />
        </div>
        <div>
          <p className="text-sm text-white/60">{label}</p>
          <h2 className="text-2xl font-semibold text-white">{value}</h2>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  title,
  href,
  icon: Icon,
}: {
  title: string;
  href: string;
  icon: any;
}) {
  return (
    <Link
      href={href}
      className="
        rounded-2xl p-6
        bg-white border border-gray-300
        dark:bg-white/5 dark:border-white/10
        backdrop-blur-xl
        hover:bg-gray-100 dark:hover:bg-white/10
        transition flex items-center justify-between
      "
    >
      <span className="font-medium text-gray-800 dark:text-white/90">
        {title}
      </span>
      <Icon className="h-5 w-5 opacity-70" />
    </Link>
  );
}
