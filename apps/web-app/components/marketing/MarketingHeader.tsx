"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

export function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="marketing-standard-header">
      <button
        type="button"
        className={`marketing-mobile-menu-toggle${menuOpen ? " is-open" : ""}`}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>

      <Link href="/" className="marketing-standard-brand" aria-label="BuildEzy home">
        <img src="/buildez-logo-light.svg" alt="BuildEzy" className="dark:hidden" />
        <img src="/buildez-logo-dark.svg" alt="" className="hidden dark:block" />
      </Link>

      <nav aria-label="Primary navigation" className="marketing-desktop-nav">
        <Link href="/#platform">Platform</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/faq">Support</Link>
      </nav>

      <div className="marketing-standard-actions">
        <Link href="/app/login" className="marketing-standard-login">Log in</Link>
        <Link href="/app/signup" className="marketing-standard-cta">Signup</Link>
      </div>

      {mounted
        ? createPortal(
            <>
              <div
                className={`marketing-mobile-menu-backdrop${menuOpen ? " is-open" : ""}`}
                onClick={() => setMenuOpen(false)}
              />
              <nav
                aria-label="Mobile navigation"
                className={`marketing-mobile-menu${menuOpen ? " is-open" : ""}`}
                aria-hidden={!menuOpen}
              >
                <Link href="/" className="marketing-mobile-menu-brand" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>
                  <img src="/buildez-logo-light.svg" alt="BuildEzy" className="dark:hidden" />
                  <img src="/buildez-logo-dark.svg" alt="" className="hidden dark:block" />
                </Link>
                <Link href="/#platform" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>Platform</Link>
                <Link href="/pricing" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>Pricing</Link>
                <Link href="/faq" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>Support</Link>
                <div className="marketing-mobile-menu-divider" />
                <Link href="/app/login" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>Log in</Link>
                <Link href="/app/signup" className="marketing-mobile-menu-cta" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>Signup</Link>
              </nav>
            </>,
            document.body,
          )
        : null}
    </header>
  );
}
