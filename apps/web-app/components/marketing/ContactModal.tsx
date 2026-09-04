"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { SupportContactForm } from "./SupportContactForm";

type ContactType = "SUPPORT" | "BUG" | "ABUSE";

export function ContactModal({ type, open, onClose }: { type: ContactType; open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="contact-modal-root" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close" className="contact-modal-backdrop" onClick={onClose} />
      <div className="contact-modal-surface">
        <button type="button" aria-label="Close" className="contact-modal-close" onClick={onClose}><X size={18} /></button>
        <SupportContactForm type={type} />
      </div>
    </div>
  );
}
