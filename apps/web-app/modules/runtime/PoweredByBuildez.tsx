export function PoweredByBuildez() {
  return (
    <a
      href="https://buildez.ai"
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
      <svg
        width="14"
        height="14"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          width="32"
          height="32"
          rx="8"
          fill="#1349A3"
        />

        <path
          d="M9 8.5h8.2c3.4 0 5.6 1.7 5.6 4.5 0 1.8-.9 3.1-2.5 3.8 2 .6 3.1 2 3.1 4.1 0 3.3-2.6 5.1-6.4 5.1H9V8.5Zm7.5 7c1.7 0 2.7-.7 2.7-2s-1-1.9-2.7-1.9h-3.8v3.9h3.8Zm.4 7.3c1.9 0 2.9-.8 2.9-2.2 0-1.5-1.1-2.2-3-2.2h-4.1v4.4h4.2Z"
          fill="white"
        />
      </svg>

      <span className="opacity-70">
        Powered by
      </span>

      <span className="font-semibold text-slate-700 dark:text-white/85">
        BuildEZ
      </span>
    </a>
  );
}
