"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function DashboardModalPortal({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { queueMicrotask(() => setMounted(true)); const previous = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = previous; }; }, []);
  useEffect(() => { if (!onClose) return; const key = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; document.addEventListener("keydown", key); return () => document.removeEventListener("keydown", key); }, [onClose]);
  if (!mounted) return null;
  return createPortal(<div data-dashboard-modal-root className="dashboard-modal-root text-slate-950 dark:text-slate-50">{children}</div>, document.body);
}
