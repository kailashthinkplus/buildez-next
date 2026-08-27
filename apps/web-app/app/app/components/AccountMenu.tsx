"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, CircleHelp, LayoutGrid, Loader2, LogOut, UserRound } from "lucide-react";

type Profile = {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
};

export default function AccountMenu({
  compact = false,
  showWorkspace = true,
}: {
  compact?: boolean;
  showWorkspace?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Profile unavailable");
        return response.json();
      })
      .then((payload) => {
        if (!cancelled) setProfile(payload.profile ?? null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout failed");
      window.location.assign("/app/login");
    } catch {
      setLogoutError("Could not log out. Please try again.");
      setLoggingOut(false);
    }
  }

  const displayName = profile?.name?.trim() || "Account";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open account menu"
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 dashboard-hover"
      >
        {profile?.avatarUrl ? (
          // User avatars can come from Google or object storage and are not
          // restricted to the hosts configured for next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatarUrl}
            alt="Profile"
            className="h-9 w-9 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/15"
          />
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-semibold text-white">
            {initials}
          </span>
        )}
        {!compact ? (
          <span className="hidden max-w-[130px] truncate text-sm font-medium sm:block">
            {displayName}
          </span>
        ) : null}
        <ChevronDown
          size={14}
          className={`hidden transition-transform sm:block ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-[1000] w-64 overflow-hidden rounded-2xl border border-slate-700/80 bg-[#071018] p-2 text-slate-100 shadow-2xl shadow-black/70"
        >
          <div className="border-b border-white/10 px-3 py-2.5">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            {profile?.email ? (
              <p className="mt-0.5 truncate text-xs text-slate-400">{profile.email}</p>
            ) : null}
          </div>

          <div className="py-1.5">
            <MenuLink href="/app/profile" icon={UserRound} onSelect={() => setOpen(false)}>
              Profile settings
            </MenuLink>
            {showWorkspace ? (
              <MenuLink href="/app/dashboard" icon={LayoutGrid} onSelect={() => setOpen(false)}>
                Workspace dashboard
              </MenuLink>
            ) : null}
            <MenuLink href="/app/help" icon={CircleHelp} onSelect={() => setOpen(false)}>
              Help & support
            </MenuLink>
          </div>

          {logoutError ? (
            <p className="mx-2 mb-1 rounded-lg bg-rose-500/10 px-2 py-1.5 text-xs text-rose-300">
              {logoutError}
            </p>
          ) : null}

          <button
            type="button"
            role="menuitem"
            disabled={loggingOut}
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-rose-400 hover:bg-rose-500/10 disabled:opacity-60"
          >
            {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  onSelect,
  children,
}: {
  href: string;
  icon: typeof UserRound;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-200 hover:bg-white/[.07]"
    >
      <Icon size={16} className="text-slate-400" />
      {children}
    </Link>
  );
}
