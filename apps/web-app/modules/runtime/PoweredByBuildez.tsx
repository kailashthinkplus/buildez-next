/**
 * Absolute so the badge points at the BuildEZ platform itself, never the
 * tenant's own (possibly custom) domain this component is rendered under.
 */
function buildezPlatformOrigin() {
  return (process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.PLATFORM_DOMAIN || "getbuildezy.com"}`).replace(/\/$/, "");
}

export function PoweredByBuildez() {
  const origin = buildezPlatformOrigin();
  return (
    <a
      href={`${origin}/`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Powered by BuildEZ"
      className="
        fixed bottom-3 right-3 z-[2147483000]
        flex items-center gap-1.5
        rounded-lg border border-black/10
        bg-white/90 px-2.5 py-1.5
        text-[10px] font-medium leading-none text-slate-500
        shadow-sm backdrop-blur-md
        transition
        hover:bg-white hover:text-slate-700
        dark:border-white/10 dark:bg-[#111827]/90 dark:text-white/55
        dark:hover:bg-[#111827] dark:hover:text-white/80
      "
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- always an absolute cross-origin URL; next/image can't optimize that. */}
      <img
        src={`${origin}/favicon.png`}
        alt=""
        width={14}
        height={14}
        className="shrink-0 rounded-[4px]"
      />

      <span className="opacity-70">
        Powered by
      </span>

      <span className="font-semibold text-slate-700 dark:text-white/85">
        BuildEZ
      </span>
    </a>
  );
}
