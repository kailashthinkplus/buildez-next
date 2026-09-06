"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, LayoutTemplate, WandSparkles, X } from "lucide-react";

import { DashboardModalPortal } from "./ui/DashboardModalPortal";

type WelcomeModalProps = {
  open: boolean;
  onClose: () => void;
  onCreateWithAi: () => void;
  onCreateWebsite: () => void;
};

const previewImages = [
  { src: "/marketing/home-v3/design.webp", alt: "BuildEZ visual website design workspace" },
  { src: "/marketing/home-v3/launch.webp", alt: "A website prepared for launch with BuildEZ" },
  { src: "/marketing/home-v3/grow.webp", alt: "BuildEZ website performance and growth tools" },
] as const;

export function WelcomeModal({
  open,
  onClose,
  onCreateWithAi,
  onCreateWebsite,
}: WelcomeModalProps) {
  if (!open) return null;

  return (
    <DashboardModalPortal onClose={onClose}>
      <div
        className="fixed inset-0 z-[150] grid place-items-center overflow-y-auto bg-slate-950/45 p-3 backdrop-blur-md sm:p-6"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-modal-title"
          aria-describedby="welcome-modal-description"
          className="dashboard-modal-surface my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl overflow-y-auto rounded-[28px] border dashboard-border shadow-2xl"
        >
          <div className="relative grid h-36 grid-cols-3 overflow-hidden rounded-t-[27px] bg-slate-950 sm:h-52">
            {previewImages.map((image) => (
              <div key={image.src} className="relative overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 640px) 33vw, 300px"
                  className="object-cover"
                />
              </div>
            ))}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/10" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close welcome guide"
              className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-slate-950/45 text-white backdrop-blur-lg transition hover:bg-slate-950/70"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 sm:p-7 lg:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
              Your workspace is ready
            </p>
            <h2 id="welcome-modal-title" className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
              Welcome to BuildEZ
            </h2>
            <p id="welcome-modal-description" className="mt-2 max-w-2xl text-sm leading-6 dashboard-muted sm:text-base">
              Start with AI, shape the design visually, and bring publishing and performance together in one workspace.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={onCreateWithAi}
                className="dashboard-control group rounded-2xl border dashboard-border p-4 text-left dashboard-hover"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300">
                  <WandSparkles size={18} />
                </span>
                <strong className="mt-4 block text-sm">Create with AI</strong>
                <span className="mt-1 block text-xs leading-5 dashboard-muted">Describe your idea and generate a polished first draft.</span>
              </button>

              <button
                type="button"
                onClick={onCreateWebsite}
                className="dashboard-control group rounded-2xl border dashboard-border p-4 text-left dashboard-hover"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
                  <LayoutTemplate size={18} />
                </span>
                <strong className="mt-4 block text-sm">Start a website</strong>
                <span className="mt-1 block text-xs leading-5 dashboard-muted">Choose the setup that fits your next website.</span>
              </button>

              <Link
                href="/app/workspace/websites"
                onClick={onClose}
                className="dashboard-control group rounded-2xl border dashboard-border p-4 dashboard-hover"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                  <BarChart3 size={18} />
                </span>
                <strong className="mt-4 block text-sm">Manage and grow</strong>
                <span className="mt-1 block text-xs leading-5 dashboard-muted">Open your websites, publishing controls, and insights.</span>
              </Link>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t dashboard-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={onClose} className="px-3 py-2 text-sm font-medium dashboard-muted transition hover:text-[var(--dashboard-text)]">
                I&rsquo;ll explore on my own
              </button>
              <button
                type="button"
                onClick={onCreateWithAi}
                className="dashboard-primary-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white"
              >
                Get started with AI
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </DashboardModalPortal>
  );
}
