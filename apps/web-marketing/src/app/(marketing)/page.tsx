"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Sparkles,
  Wand2,
  Layout,
  Zap,
  Gauge,
  Globe,
  ShieldCheck,
  Layers,
  Cpu,
  Rocket,
  ArrowRight,
  CheckCircle2,
  Mail,
  Boxes,
  ImageIcon,
  Search,
  Settings2,
  Workflow,
  Mic,
  Menu,
  X,
} from "lucide-react";

import BackgroundLayers from "../../components/BackgroundLayers";
import AnimatedCTA from "../../components/AnimatedCTA";
import AiPromptBox from "../../components/AiPromptBox";
import { useParallax } from "../../hooks/useParallax";
import FAQSection from '../../components/ui/FAQSection';

/* ---------- typewriter (no sliding) ---------- */
function TypewriterFixed({
  leftLabel,
  text,
}: {
  leftLabel: string;
  text?: string;
}) {
  const [out, setOut] = useState("");

  useEffect(() => {
    if (!text) return;
    let i = 0;
    setOut("");
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [text]);

  if (!text) return null;

  return (
    <div className="flex items-center gap-3 text-white/80">
      <span className="text-white/55 whitespace-nowrap">{leftLabel}</span>
      <span className="min-w-0 md:min-w-[520px] text-left">
        {out}
        <span className="opacity-50 animate-pulse">▍</span>
      </span>
    </div>
  );
}

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ================= AI TYPEWRITER ================= */
  const AI_PROMPTS = [
    "a modern company website with clean sections, SEO copy, and premium visuals…",
    "a high-conversion product landing page with hero CTA, pricing, and FAQ…",
    "a portfolio website with case studies, testimonials, and contact form…",
  ];

  const promptRef = useRef<HTMLTextAreaElement | null>(null);
  const [aiValue, setAiValue] = useState("");
  const [aiTyped, setAiTyped] = useState("");
  const [aiPromptIndex, setAiPromptIndex] = useState(0);

  useEffect(() => {
    if (aiValue) return;

    let i = 0;
    let cancelled = false;
    const active = AI_PROMPTS[aiPromptIndex];
    setAiTyped("");

    const tick = () => {
      if (cancelled) return;
      i++;
      setAiTyped(active.slice(0, i));

      if (i < active.length) {
        setTimeout(tick, 22);
      } else {
        setTimeout(() => {
          if (!cancelled) {
            setAiPromptIndex((p) => (p + 1) % AI_PROMPTS.length);
          }
        }, 1400);
      }
    };

    const t = setTimeout(tick, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [aiPromptIndex, aiValue]);

  /* ---------- PARALLAX (decorative only) ---------- */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const speed = Number(el.dataset.speed || 0.06);
        el.style.transform = `translateY(${y * speed}px)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- HEADER SCROLL BLUR BOOST ---------- */
  useEffect(() => {
    const header = document.querySelector(".header-blur") as HTMLElement | null;
    if (!header) return;

    const onScroll = () => {
      const y = Math.min(window.scrollY, 120);

      const style = header.style as any;
      style.backdropFilter = `blur(${22 + y * 0.05}px) saturate(1.2)`;
      style.webkitBackdropFilter = `blur(${22 + y * 0.05}px) saturate(1.2)`;

      header.style.background = `linear-gradient(
        180deg,
        rgba(10,12,18,${0.72 + y * 0.002}),
        rgba(10,12,18,${0.52 + y * 0.002})
      )`;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
    setMobileOpen(false);
  };

  const gotoAuth = () => {
    window.location.href = "/signup";
  };
  return (
    <main className="relative min-h-screen text-white page-bg overflow-x-hidden">
      {/* ================= GLOBAL BACKGROUND (CONTINUOUS) ================= */}
      <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
        <BackgroundLayers />

        {/* ambient blob left */}
        <div
          data-parallax
          data-speed="0.015"
          className="absolute top-[15%] left-[8%] h-[700px] w-[700px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(79,140,255,.18), transparent 70%)",
            filter: "blur(110px)",
          }}
        />

        {/* ambient blob right */}
        <div
          data-parallax
          data-speed="0.02"
          className="absolute top-[55%] right-[5%] h-[800px] w-[800px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(140,90,255,.22), transparent 70%)",
            filter: "blur(130px)",
          }}
        />
      </div>

      {/* ================= HEADER ================= */}
      <header className="fixed inset-x-0 top-0 z-50 header-glass header-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => scrollTo("hero")}
            className="flex items-center gap-2"
          >
            <img
              src="/buildez-logo-light.svg"
              alt="BuildEZ"
              className="h-auto w-[210px]"
              loading="lazy"
            />
          </button>

          <div className="hidden md:flex items-center gap-3 nav-pill">
            <button
              className="px-3 py-2 text-sm text-white/70 hover:text-white"
              onClick={() => scrollTo("hero")}
            >
              Home
            </button>
            <button
              className="px-3 py-2 text-sm text-white/70 hover:text-white"
              onClick={() => scrollTo("ai")}
            >
              AI System
            </button>
            <button
              className="px-3 py-2 text-sm text-white/70 hover:text-white"
              onClick={() => scrollTo("features")}
            >
              Features
            </button>
            <button
              className="px-3 py-2 text-sm text-white/70 hover:text-white"
              onClick={() => scrollTo("compare")}
            >
              Compare
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={gotoAuth}
              className="hidden sm:inline-flex btn-ghost px-5 py-2.5 text-xs sm:text-sm font-semibold backdrop-blur-xl"
            >
              Signup / Signin
            </button>

            <button
              className="md:hidden inline-flex items-center justify-center rounded-full bg-white/10 border border-white/15 p-2"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* ================= MOBILE MENU ================= */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/80 backdrop-blur-2xl">
            <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1 text-sm">
              <button
                onClick={() => scrollTo("hero")}
                className="py-2 text-left text-white/80 hover:text-white"
              >
                Home
              </button>
              <button
                onClick={() => scrollTo("ai")}
                className="py-2 text-left text-white/80 hover:text-white"
              >
                AI System
              </button>
              <button
                onClick={() => scrollTo("features")}
                className="py-2 text-left text-white/80 hover:text-white"
              >
                Features
              </button>
              <button
                onClick={() => scrollTo("compare")}
                className="py-2 text-left text-white/80 hover:text-white"
              >
                Compare
              </button>

              <button
                onClick={gotoAuth}
                className="mt-2 inline-flex justify-center rounded-full bg-white text-black font-semibold py-2"
              >
                Signup / Signin
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}
      <section
        id="hero"
        className="pt-24 sm:pt-28 md:pt-36 pb-16 sm:pb-20 relative"
      >
        <div
          data-parallax
          data-speed="0.06"
          className="absolute -top-32 left-1/2 -translate-x-1/2 h-[460px] sm:h-[520px] md:h-[620px] w-[90%] sm:w-[780px] md:w-[980px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(79,140,255,.25), rgba(140,90,255,.18), transparent 65%)",
            filter: "blur(50px)",
            opacity: 0.9,
          }}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full btn-ghost text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80" />
              AI + Visual Builder + High Performance Output
            </div>

            <h3 className="mt-6 sm:mt-8 big-kicker font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
              Generate, Design,
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-400">
                Publish Websites
              </span>
              <br />
              Effortlessly, Instantly.
            </h3>

            <p className="mt-6 sm:mt-8 max-w-xl sub-kicker text-sm sm:text-base">
              BuildEZ turns an idea into a live, premium website - automatically.
              AI builds the theme, content, and visuals, while you stay in full
              control. No plugins. No maintenance. Just speed.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div
                onClick={gotoAuth}
                className="cta-glow-border cursor-pointer"
              >
                <span className="cta-inner">
                  Signup / Signin
                  <ArrowRight className="w-5 h-5" />
                </span>
              </div>

              <button
                onClick={() => scrollTo("features")}
                className="btn-ghost px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base"
              >
                Explore Features
              </button>
            </div>
          </div>

          {/* right visual */}
          <div className="relative mt-6 lg:mt-0">
            <div className="absolute -top-4 sm:-top-6 right-4 sm:right-8 floating">
              <div className="hero-orb relative">
                <div className="ring" />
              </div>
            </div>

            <div className="glow-border card-premium p-3 sm:p-4">
              <div className="spotlight" />
              <div className="relative overflow-hidden rounded-[18px] sm:rounded-[22px]">
                <img
                  src="/stock/dash.png"
                  alt="Dashboard preview"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ================= AI HERO + PROMPT SECTION ================= */}
      <section
        id="ai"
        className="relative overflow-hidden bg-black pt-20 sm:pt-24 md:pt-28 pb-20 sm:pb-24"
      >
        {/* Vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),rgba(0,0,0,0.92))]" />

        {/* Primary Blob */}
        <div
          data-parallax
          data-speed="0.06"
          className="pointer-events-none absolute left-1/2 top-[420px] h-[520px] sm:h-[700px] md:h-[780px] w-[520px] sm:w-[700px] md:w-[780px] rounded-full"
          style={{
            transform: "translateX(-50%)",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.55), rgba(99,102,241,0.35), transparent 70%)",
            filter: "blur(160px)",
            opacity: 0.9,
            willChange: "transform",
          }}
        />

        {/* Secondary Blob */}
        <div
          data-parallax
          data-speed="0.03"
          className="pointer-events-none absolute left-1/2 top-[420px] h-[900px] sm:h-[1100px] md:h-[1200px] w-[900px] sm:w-[1100px] md:w-[1200px] rounded-full"
          style={{
            transform: "translateX(-50%)",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%)",
            filter: "blur(240px)",
            willChange: "transform",
          }}
        />

        {/* CONTENT */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white">
            Build powerful{" "}
            <span className="text-blue-400">websites</span>{" "}
            with AI
          </h2>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-white/70">
            Describe what you want. BuildEZ generates the layout, content, and visuals — instantly.
          </p>

          <p className="mt-2 text-xs sm:text-sm text-white/50">
            Edit visually. Export clean code. No plugins. No maintenance.
          </p>

          {/* PROMPT BOX */}
          <div
            className="
              group relative mx-auto mt-8 sm:mt-10 max-w-3xl rounded-2xl
              backdrop-blur-2xl bg-white/[0.06]
              border border-white/20
              shadow-[0_30px_80px_rgba(0,0,0,0.6)]
              transition
              hover:border-blue-400/60
              hover:shadow-[0_0_40px_rgba(56,189,248,0.65)]
            "
          >
            <div className="pointer-events-none absolute inset-[1px] rounded-[14px] border border-white/10" />

            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-start gap-4 px-4 sm:px-6 py-5 sm:py-6 min-h-[120px]">
              {/* MODE */}
              <div className="flex flex-row sm:flex-col gap-2 pt-0 sm:pt-1">
                <button className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs bg-white text-black">
                  <Globe className="h-3.5 w-3.5" />
                  Web
                </button>
              </div>

              {/* INPUT */}
              <div className="relative flex-1 text-left">
                {!aiValue && (
                  <div className="absolute inset-0 flex items-start text-xs sm:text-sm text-white/50 pointer-events-none pt-1">
                    {aiTyped}
                    <span className="ml-1 animate-pulse">|</span>
                  </div>
                )}

                <textarea
                  ref={promptRef}
                  rows={3}
                  value={aiValue}
                  onChange={(e) => setAiValue(e.target.value)}
                  className="w-full resize-none bg-transparent text-xs sm:text-sm text-white outline-none leading-relaxed"
                />
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-end sm:justify-center gap-3 pt-0 sm:pt-1">
                <button
                  type="button"
                  className="
                    h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center
                    bg-white/10 border border-white/20
                    transition
                    hover:border-blue-400/60
                    hover:shadow-[0_0_20px_rgba(56,189,248,0.7)]
                  "
                >
                  <Mic className="h-4 w-4 text-white/80" />
                </button>

                <button
                  type="button"
                  onClick={gotoAuth}
                  className="
                    h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center
                    bg-blue-600
                    transition
                    hover:bg-blue-500
                    hover:shadow-[0_0_25px_rgba(56,189,248,0.9)]
                  "
                >
                  <ArrowRight className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* QUICK PROMPTS */}
          <div className="mt-5 sm:mt-6 flex flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-white/70">
            {[
              {
                label: "Business website",
                prompt:
                  "a modern business website with clean sections, trust signals, SEO-optimized copy, and a clear call-to-action",
              },
              {
                label: "Product landing page",
                prompt:
                  "a high-conversion product landing page with hero section, feature highlights, testimonials, pricing, and FAQ",
              },
              {
                label: "Portfolio",
                prompt:
                  "a professional portfolio website showcasing projects, case studies, testimonials, and a contact section",
              },
              {
                label: "Startup launch",
                prompt:
                  "a startup launch website with bold value proposition, early access signup, social proof, and FAQ",
              },
            ].map(({ label, prompt }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setAiValue(prompt);
                  requestAnimationFrame(() => promptRef.current?.focus());
                }}
                className="
                  rounded-full px-3 sm:px-4 py-1.5 sm:py-2
                  bg-white/10
                  border border-white/15
                  transition
                  hover:border-blue-400/60
                  hover:shadow-[0_0_20px_rgba(56,189,248,0.6)]
                "
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>
      {/* ================= PROOF HEADLINE ================= */}
      <section id="proof" className="py-16 sm:py-20 text-center">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
            Trusted for <span className="text-blue-400">speed,</span>
            <span className="text-white/40"> loved for simplicity</span>
          </h2>
          <p className="mt-5 sm:mt-6 text-sm sm:text-lg text-white/65">
            BuildEZ is designed to remove the painful parts of building websites — setup, plugins,
            slow performance, and endless revisions — while keeping full creative control.
          </p>
        </div>
      </section>

      {/* ================= FEATURE CARDS ================= */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 sm:gap-8">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
              Discover core platform features
            </h3>
            <button
              onClick={gotoAuth}
              className="btn-ghost px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold self-stretch sm:self-auto"
            >
              Signup / Signin
            </button>
          </div>

          {/* ---------- First row ---------- */}
          <div className="mt-10 sm:mt-14 grid lg:grid-cols-2 gap-8 lg:gap-10">
            <div className="card-premium p-7 sm:p-10 glow-border">
              <div className="spotlight" />
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-12 h-12 rounded-2xl btn-ghost flex items-center justify-center shrink-0">
                  <Layout className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xl sm:text-2xl font-semibold">
                    No-code Visual Builder
                  </div>
                  <div className="text-white/65 mt-2 text-sm sm:text-base">
                    Build pages with structured sections, consistent spacing, and reusable components.
                  </div>
                </div>
              </div>

              <div className="mt-7 sm:mt-8 space-y-3 sm:space-y-4 text-white/70 text-sm">
                <div className="flex gap-2.5 sm:gap-3 items-start">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 mt-0.5" />
                  <span>Drag-and-drop layout with real control (not “toy blocks”)</span>
                </div>
                <div className="flex gap-2.5 sm:gap-3 items-start">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 mt-0.5" />
                  <span>Mobile + desktop previews with responsive behavior</span>
                </div>
                <div className="flex gap-2.5 sm:gap-3 items-start">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 mt-0.5" />
                  <span>Export-ready output + performance-first structure</span>
                </div>
              </div>
            </div>

            <div className="glow-border card-premium p-3 sm:p-4">
              <div className="spotlight" />
              <div className="overflow-hidden rounded-[18px] sm:rounded-[22px] relative">
                <img
                  src="/stock/dashboard-ui.jpg"
                  alt="AI-built marketing dashboard"
                  className="w-full h-auto"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(900px 360px at 20% 0%, rgba(140,90,255,.22), transparent 62%), radial-gradient(860px 360px at 95% 10%, rgba(79,140,255,.16), transparent 65%)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ---------- Second row ---------- */}
          <div className="mt-8 sm:mt-10 grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <div className="glow-border card-premium p-3 sm:p-4 order-2 lg:order-1">
              <div className="spotlight" />
              <div className="overflow-hidden rounded-[18px] sm:rounded-[22px] relative">
                <img
                  src="/stock/ai-neon.jpg"
                  alt="AI generation"
                  className="w-full h-auto"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(900px 360px at 20% 0%, rgba(79,140,255,.18), transparent 62%), radial-gradient(860px 360px at 95% 10%, rgba(140,90,255,.20), transparent 65%)",
                  }}
                />
              </div>
            </div>

            <div className="flex justify-center order-1 lg:order-2">
              <div className="card-premium p-7 sm:p-10 glow-border max-w-xl w-full">
                <div className="spotlight" />
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 rounded-2xl btn-ghost flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-semibold">
                      AI Theme + Content + Assets
                    </div>
                    <div className="text-white/65 mt-2 text-sm sm:text-base">
                      Generate complete sections, SEO copy, and visuals — then refine in the editor.
                    </div>
                  </div>
                </div>

                <div className="mt-7 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
                  {[
                    { icon: <Wand2 className="w-5 h-5 text-blue-400" />, t: "Theme generator", d: "Color, typography, spacing" },
                    { icon: <Search className="w-5 h-5 text-blue-400" />, t: "SEO generator", d: "Structure & page copy" },
                    { icon: <ImageIcon className="w-5 h-5 text-blue-400" />, t: "Asset generator", d: "Images, icons, visuals" },
                    { icon: <Workflow className="w-5 h-5 text-blue-400" />, t: "Automation", d: "Repeatable tasks handled" },
                  ].map((x) => (
                    <div
                      key={x.t}
                      className="btn-ghost rounded-2xl px-5 sm:px-6 py-4 text-left sm:text-center min-w-[230px]"
                    >
                      <div className="flex items-center justify-center gap-3 text-white/85">
                        {x.icon}
                        <div className="font-semibold">{x.t}</div>
                      </div>
                      <div className="text-xs text-white/60 mt-2">{x.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* ---------- Third row – built for workflows ---------- */}
          <div className="mt-8 sm:mt-10 grid lg:grid-cols-2 gap-8 lg:gap-10">
            <div className="card-premium p-7 sm:p-10 glow-border">
              <div className="spotlight" />
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-12 h-12 rounded-2xl btn-ghost flex items-center justify-center shrink-0">
                  <Boxes className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xl sm:text-2xl font-semibold">
                    Built for real workflows
                  </div>
                  <div className="text-white/65 mt-2 text-sm sm:text-base">
                    Organize projects, keep styles consistent, and ship faster with reusable systems.
                  </div>
                </div>
              </div>

              <div className="mt-7 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
                {[
                  { icon: <Layers className="w-5 h-5 text-blue-400" />, t: "Reusable sections", d: "Faster editing & consistency" },
                  { icon: <Settings2 className="w-5 h-5 text-blue-400" />, t: "Design tokens", d: "Safe and consistent styling" },
                  { icon: <Zap className="w-5 h-5 text-blue-400" />, t: "Fast publishing", d: "Push changes instantly" },
                  { icon: <ShieldCheck className="w-5 h-5 text-blue-400" />, t: "Secure hosting", d: "Always online, protected" },
                ].map((x) => (
                  <div
                    key={x.t}
                    className="btn-ghost rounded-2xl px-5 sm:px-6 py-4 text-left sm:text-center min-w-[230px]"
                  >
                    <div className="flex items-center justify-center gap-3 text-white/85">
                      {x.icon}
                      <div className="font-semibold">{x.t}</div>
                    </div>
                    <div className="text-xs text-white/60 mt-2">{x.d}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glow-border card-premium p-3 sm:p-4">
              <div className="spotlight" />
              <div className="overflow-hidden rounded-[18px] sm:rounded-[22px] relative">
                <img
                  src="/stock/integrations.jpg"
                  alt="Integrations"
                  className="w-full h-auto"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(900px 360px at 10% 0%, rgba(140,90,255,.22), transparent 62%), radial-gradient(860px 360px at 95% 10%, rgba(79,140,255,.14), transparent 65%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ================= COMPARISON TABLE ================= */}
      <section id="compare" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-center">
            <span className="text-blue-400">BuildEZ</span> compared to traditional CMS tools
          </h2>
          <p className="mt-5 sm:mt-6 text-sm sm:text-lg text-white/65 text-center max-w-3xl mx-auto">
            Most tools require plugins, setup, and constant maintenance. BuildEZ
            is designed to be fast, simple, AI-powered, and optimized from day one.
          </p>

          <div className="mt-10 sm:mt-14 glow-border card-premium overflow-hidden">
            <div className="spotlight" />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="p-4 sm:p-6 text-sm sm:text-lg">Capability</th>
                    <th className="p-4 sm:p-6 text-sm sm:text-lg">BuildEZ</th>
                    <th className="p-4 sm:p-6 text-sm sm:text-lg">Wix</th>
                    <th className="p-4 sm:p-6 text-sm sm:text-lg">WordPress</th>
                    <th className="p-4 sm:p-6 text-sm sm:text-lg">Webflow</th>
                  </tr>
                </thead>

                <tbody>
                  {[
                    {
                      label: "AI generates layout + theme",
                      icon: <Cpu className="w-4 h-4 text-blue-400" />,
                      buildez: { text: "Full-stack AI themes", ok: true },
                      wix: { text: "Basic ADI layouts", ok: true },
                      wp: { text: "Plugin-based only", ok: false },
                      webflow: { text: "Limited AI helpers", ok: false },
                    },
                    {
                      label: "AI writes page content & SEO",
                      icon: <Search className="w-4 h-4 text-blue-400" />,
                      buildez: { text: "Integrated content/SEO", ok: true },
                      wix: { text: "AI text assist", ok: true },
                      wp: { text: "Depends on plugins", ok: false },
                      webflow: { text: "AI text beta", ok: true },
                    },
                    {
                      label: "AI creates images/assets",
                      icon: <ImageIcon className="w-4 h-4 text-blue-400" />,
                      buildez: { text: "Built-in assets", ok: true },
                      wix: { text: "Stock & AI images", ok: true },
                      wp: { text: "Plugins + manual", ok: false },
                      webflow: { text: "Manual/third-party", ok: false },
                    },
                    {
                      label: "Fast performance by default",
                      icon: <Zap className="w-4 h-4 text-blue-400" />,
                      buildez: { text: "Performance-first output", ok: true },
                      wix: { text: "Good, but heavy", ok: true },
                      wp: { text: "Depends on stack", ok: false },
                      webflow: { text: "Generally strong", ok: true },
                    },
                    {
                      label: "Hosting included, no setup",
                      icon: <Globe className="w-4 h-4 text-blue-400" />,
                      buildez: { text: "Fully managed", ok: true },
                      wix: { text: "Included", ok: true },
                      wp: { text: "Self/managed hosting", ok: false },
                      webflow: { text: "Included", ok: true },
                    },
                    {
                      label: "No maintenance (no plugins)",
                      icon: <ShieldCheck className="w-4 h-4 text-blue-400" />,
                      buildez: { text: "No plugins needed", ok: true },
                      wix: { text: "Low maintenance", ok: true },
                      wp: { text: "High plugin upkeep", ok: false },
                      webflow: { text: "Low maintenance", ok: true },
                    },
                    {
                      label: "Visual editing (no code)",
                      icon: <Layout className="w-4 h-4 text-blue-400" />,
                      buildez: { text: "Visual + AI builder", ok: true },
                      wix: { text: "Visual editor", ok: true },
                      wp: { text: "Block + page builders", ok: true },
                      webflow: { text: "Advanced visual editor", ok: true },
                    },
                  ].map((row) => (
                    <tr key={row.label} className="border-t border-white/10">
                      <td className="p-4 sm:p-6 text-white/70">
                        <span className="inline-flex items-center gap-2">
                          {row.icon}
                          <span>{row.label}</span>
                        </span>
                      </td>

<td className="p-4 sm:p-6 bg-white/5 border-x border-blue-400/30">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                          {row.buildez.ok ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-red-300" />
                          )}
                          {row.buildez.text}
                        </span>
                      </td>

                      {[row.wix, row.wp, row.webflow].map((cell, i) => (
                        <td key={i} className="p-4 sm:p-6 text-white/60">
                          <span className="inline-flex items-center gap-1.5">
                            {cell.ok ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/80" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-red-400/80" />
                            )}
                            {cell.text}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ---------- KPI cards ---------- */}
          <div className="mt-8 sm:mt-10 grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: <Gauge className="w-6 h-6" />,
                t: "Top speed",
                d: "Clean output that loads fast by default.",
                grad: "from-sky-500/60 via-blue-500/40 to-indigo-500/60",
              },
              {
                icon: <Search className="w-6 h-6" />,
                t: "Top SEO",
                d: "Structure and content designed to rank.",
                grad: "from-blue-500/50 via-blue-500/70 to-purple-500/25",
              },
              {
                icon: <Globe className="w-6 h-6" />,
                t: "Hosting + reliability",
                d: "Stable, secure, and always online.",
                grad: "from-indigo-400/60 via-blue-500/40 to-sky-400/60",
              },
            ].map((x) => (
              <div
                key={x.t}
                className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 glow-border bg-gradient-to-br ${x.grad}`}
              >
                <div className="pointer-events-none absolute inset-[1px] rounded-[26px] bg-black/75 backdrop-blur-2xl" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
                    {x.icon}
                  </div>
                  <div className="text-lg font-semibold">{x.t}</div>
                  <div className="text-white/65 mt-2 text-sm">{x.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ================= FAQ ================= */}
{/* ================= FAQ SECTION ================= */}
<section
  id="faq"
  className="relative z-10 max-w-5xl mx-auto px-6 py-24"
>
  <FAQSection />
</section>
{/* =============== END FAQ SECTION =============== */}



      {/* ================= FINAL CTA ================= */}
      <section className="py-20 sm:py-28 relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <div
            className="
              relative
              rounded-3xl
              px-6 sm:px-10 py-10 sm:py-14
              max-w-5xl mx-auto
              text-center
              backdrop-blur-2xl
              bg-gradient-to-br
              from-blue-500/25
              via-emerald-400/18
              to-purple-500/25
              border border-white/20
              shadow-[0_25px_80px_rgba(0,0,0,0.55)]
              overflow-hidden
            "
          >
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.45),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.4),transparent_60%),radial-gradient(circle_at_top_right,rgba(129,140,248,0.4),transparent_55%)] blur-3xl" />

            <div className="spotlight" />

            <h3 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
              Build a premium website in hours — not weeks
            </h3>

            <p className="mt-5 sm:mt-6 text-base sm:text-xl text-white/70 max-w-3xl mx-auto">
              BuildEZ replaces setup, plugins, and manual work with AI and a
              visual editor — so you can launch faster, look better, and stay
              maintenance-free.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button
                onClick={gotoAuth}
                className="cta-cruip cta-cruip--auto text-base sm:text-lg"
              >
                <span className="cta-cruip__text cta-cruip__text--a">
                  Signup / Signin
                  <span className="cta-cruip__arrow">→</span>
                </span>

                <span className="cta-cruip__text cta-cruip__text--b">
                  Get Started
                  <span className="cta-cruip__arrow">→</span>
                </span>
              </button>

              <button
                onClick={() => scrollTo("footer")}
                className="btn-ghost px-10 sm:px-12 py-3.5 sm:py-4 text-sm sm:text-lg"
              >
                Get updates
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer id="footer" className="footer-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 grid md:grid-cols-3 gap-10 sm:gap-16">
          <div>
            <img
              src="/buildez-logo-light.svg"
              alt="BuildEZ"
              className="h-auto w-[210px]"
              loading="lazy"
            />
            <p className="mt-5 sm:mt-6 text-white/60 text-xs sm:text-sm leading-relaxed max-w-sm">
              BuildEZ helps you design, generate and publish websites with AI —
              fast, clean, and maintenance-free. Built for teams that want
              premium output without complexity.
            </p>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 sm:space-y-3 text-white/60 text-sm">
              <li className="hover:text-white/80 cursor-pointer">Privacy</li>
              <li className="hover:text-white/80 cursor-pointer">Terms</li>
              <li className="hover:text-white/80 cursor-pointer">Contact</li>
            </ul>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Subscribe to newsletter
            </h4>
            <p className="text-white/60 text-xs sm:text-sm mb-4 sm:mb-6 max-w-xs">
              Product updates, AI features, templates, and launch news.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 btn-ghost rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
                <Mail className="w-4 h-4 text-white/60" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="bg-transparent outline-none w-full text-xs sm:text-sm"
                />
              </div>
              <button className="btn-glow px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm flex items-center justify-center">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-4 sm:py-6 text-center text-xs sm:text-sm text-white/50">
          © {new Date().getFullYear()} BuildEZ · Built in India 🇮🇳
        </div>
      </footer>
    </main>
  );
}
