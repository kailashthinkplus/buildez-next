import Link from "next/link";
import { ArrowRight, Globe2, Sparkles } from "lucide-react";

export default function EmptyPublicWebsite() {
  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#f6f8fc] px-6 py-16 text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,.16),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(124,58,237,.12),transparent_34%)]" />
      <section className="relative m-auto w-full max-w-3xl overflow-hidden rounded-[36px] border border-white/80 bg-white/80 p-8 text-center shadow-[0_30px_100px_rgba(15,23,42,.12)] backdrop-blur-xl sm:p-14">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
          <Globe2 size={29} />
        </span>
        <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          <Sparkles size={13} /> Your next website starts here
        </div>
        <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-semibold tracking-[-.05em] sm:text-6xl">
          Build a website people remember.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
          Describe your idea and BuildEZ will help shape the pages, design, images and interactions into a publish-ready website.
        </p>
        <Link href="/app" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">
          Get started <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
