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
import CopilotPromptCard from "../../components/CopilotPromptCard";

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
        bg-transparent
      "
    >
      <div className="w-full overflow-y-auto pb-24">

        {/* ================================================= */}
        {/* HEADER / AI PROMPT                                */}
        {/* ================================================= */}

        <section className="px-4 sm:px-6 md:px-10 pt-16 pb-20">
          <div className="mx-auto max-w-5xl text-center">

            <p className="mb-3 text-xs uppercase tracking-wide dashboard-muted font-semibold">
              Site dashboard · {siteSlug}
            </p>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Build & grow your{" "}
              <span className="text-blue-600 dark:text-blue-400">
                website
              </span>{" "}
              with AI
            </h1>

            <p className="mt-4 text-sm sm:text-base dashboard-muted">
              Generate pages, sections, and content tailored to this site.
            </p>

            <CopilotPromptCard
              contextLabel={`${siteSlug} site`}
              subtitle="Ask for pages, sections, content, visuals, or polish. Agents coordinate the no-code workflow."
            />
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
    <div className="site-kpi-card relative rounded-2xl p-5">
      <div className="flex items-center gap-4">
        <div className="site-kpi-icon h-10 w-10 flex items-center justify-center rounded-xl">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm dashboard-muted">{label}</p>
          <h2 className="text-2xl font-semibold">{value}</h2>
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
        dashboard-card
        backdrop-blur-xl
        dashboard-hover
        transition flex items-center justify-between
      "
    >
      <span className="font-medium">
        {title}
      </span>
      <Icon className="h-5 w-5 opacity-70" />
    </Link>
  );
}
