"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Mic,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useWorkspace } from "../components/WorkspaceContext";

/* ============================================================
   GLOBAL DASHBOARD (NO SITE CONTEXT)
============================================================ */

export default function GlobalDashboardPage() {
  const { websites, loading } = useWorkspace();

  /* ----------------------------------------- */
  /* AI PROMPT STATE (UNCHANGED)               */
  /* ----------------------------------------- */

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
    <div className="flex flex-col flex-1 h-full">
      <div className="w-full overflow-y-auto pb-24">

        {/* ================================================= */}
        {/* AI PROMPT HEADER (GLOBAL)                         */}
        {/* ================================================= */}

        <section className="px-4 sm:px-6 md:px-10 pt-20 pb-20">
          <div className="mx-auto max-w-5xl text-center">

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Build powerful{" "}
              <span className="text-blue-600 dark:text-blue-400">websites</span>{" "}
              with AI
            </h1>

            <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-white/70">
              Describe what you want. BuildEZ generates the layout, content, and visuals.
            </p>

            {/* AI PROMPT BOX */}
            <div className="relative mx-auto mt-10 max-w-3xl rounded-2xl bg-white/80 dark:bg-white/[0.06] border border-gray-300 dark:border-white/20 shadow-xl">
              <div className="relative flex items-center gap-4 px-6 py-6">

                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs bg-gray-200 dark:bg-white text-black">
                    <Globe className="h-3.5 w-3.5" />
                    Web
                  </span>
                </div>

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
        {/* YOUR WEBSITES (WEBFLOW STYLE GRID)               */}
        {/* ================================================= */}

        <section className="px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Websites
            </h2>

<Link
  href="/app/onboarding"
  className="
    inline-flex items-center gap-2
    px-4 py-2 rounded-xl
    bg-blue-600 hover:bg-blue-500
    text-sm font-medium text-white
    transition
  "
>
  + Add website
</Link>

          </div>

          {loading ? (
            <div className="opacity-50 text-sm">Loading websites…</div>
          ) : websites.length === 0 ? (
            <EmptyState />
          ) : (
            <WebsiteGrid websites={websites} />
          )}
        </section>
      </div>
    </div>
  );
}

/* ============================================================
   WEBSITE GRID
============================================================ */

function WebsiteGrid({ websites }: { websites: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {websites.map((site) => (
        <div
          key={site.id}
          className="group rounded-2xl overflow-hidden border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 hover:shadow-xl transition"
        >
          {/* PREVIEW PLACEHOLDER */}
          <div className="relative h-44 bg-gradient-to-br from-gray-200 to-gray-100 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-xs opacity-50">
            Preview
          </div>

          {/* META */}
          <div className="p-5 flex flex-col gap-3">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {site.name}
              </h3>
              <p className="text-xs opacity-60">
                {site.slug}.buildez.site
              </p>
            </div>

            <div className="flex gap-3">
<div>
<Link
  href={`/app/${site.slug}/dashboard`}
  className="
    w-full inline-flex justify-center items-center
    text-sm px-4 py-2 rounded-xl
    border border-gray-300 dark:border-white/20
    text-gray-800 dark:text-white/90
    hover:bg-gray-100 dark:hover:bg-white/10
    transition
  "
>
  Visit Website
</Link>

</div>

            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState() {
  return (
    <div className="rounded-2xl p-10 text-center bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10">
      <p className="text-sm opacity-70">
        You haven’t created any websites yet.
      </p>
      <Link
        href="/app/onboarding"
        className="inline-block mt-4 text-sm text-blue-600 hover:underline"
      >
        Create your first website →
      </Link>
    </div>
  );
}
