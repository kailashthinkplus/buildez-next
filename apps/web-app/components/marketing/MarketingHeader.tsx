"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

export function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="marketing-standard-header">
      <button
        type="button"
        className="marketing-mobile-menu-toggle"
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

      {menuOpen
        ? createPortal(
            <>
              <div className="marketing-mobile-menu-backdrop" onClick={() => setMenuOpen(false)} />
              <nav aria-label="Mobile navigation" className="marketing-mobile-menu">
                <Link href="/#platform" onClick={() => setMenuOpen(false)}>Platform</Link>
                <Link href="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
                <Link href="/faq" onClick={() => setMenuOpen(false)}>Support</Link>
                <div className="marketing-mobile-menu-divider" />
                <Link href="/app/login" onClick={() => setMenuOpen(false)}>Log in</Link>
                <Link href="/app/signup" className="marketing-mobile-menu-cta" onClick={() => setMenuOpen(false)}>Signup</Link>
              </nav>
            </>,
            document.body,
          )
        : null}
    </header>
  );
}
