"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useGlobalScrollFx } from "@/components/motion/primitives";
import { logMarketingCtaClick } from "@/modules/legal/MarketingAnalytics";
import { Arrow } from "./Arrow";

export function HomeNav() {
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuMounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  // Mounted once, here, for the whole homepage: drives the --scroll CSS var
  // (ambient orbit/craft drift) and the .reveal fade-in IntersectionObserver
  // that every section below relies on.
  useGlobalScrollFx();

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <nav className={`topbar${headerScrolled ? " is-scrolled" : ""}`} aria-label="Main navigation">
        <button
          type="button"
          className={`marketing-mobile-menu-toggle${menuOpen ? " is-open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <svg className="marketing-menu-icon marketing-menu-icon-bars" viewBox="0 0 20 14" fill="none" aria-hidden="true">
            <rect x="0" y="0" width="20" height="2.6" rx="1.3" fill="currentColor" />
            <rect x="0" y="5.7" width="20" height="2.6" rx="1.3" fill="currentColor" />
            <rect x="0" y="11.4" width="11" height="2.6" rx="1.3" fill="currentColor" />
          </svg>
          <svg className="marketing-menu-icon marketing-menu-icon-close" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
        <a href="#top" className="brand" aria-label="BuildEzy home">
          <img className="official-logo" src="/buildez-logo-dark.svg" alt="BuildEzy" />
        </a>
        <div className="nav-links">
          <a href="#platform">Platform</a>
          <a href="#difference">Why Build Ezy</a>
          <a href="#workflow">How it works</a>
          <Link href="/pricing">Pricing</Link>
        </div>
        <div className="nav-actions">
          <Link href="/app/login" className="login-link" onClick={() => logMarketingCtaClick("nav_login")}>
            Log In
          </Link>
          <Link href="/app/signup" className="mini-cta" onClick={() => logMarketingCtaClick("nav_signup")}>
            Signup <Arrow />
          </Link>
        </div>
      </nav>
      {menuMounted
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
                <div className="marketing-mobile-menu-header">
                  <a href="#top" className="marketing-mobile-menu-brand" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>
                    <img src="/buildez-logo-dark.svg" alt="BuildEzy" />
                  </a>
                  <button
                    type="button"
                    className="marketing-mobile-menu-close"
                    aria-label="Close menu"
                    onClick={() => setMenuOpen(false)}
                    tabIndex={menuOpen ? 0 : -1}
                  >
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <span className="marketing-mobile-menu-label">Explore Build Ezy</span>
                <a href="#platform" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>Platform</a>
                <a href="#difference" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>Why Build Ezy</a>
                <a href="#workflow" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>How it works</a>
                <Link href="/pricing" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>Pricing</Link>
                <div className="marketing-mobile-menu-divider" />
                <div className="marketing-mobile-menu-actions">
                  <Link
                    href="/app/login"
                    className="marketing-mobile-menu-login"
                    onClick={() => {
                      logMarketingCtaClick("nav_login");
                      setMenuOpen(false);
                    }}
                    tabIndex={menuOpen ? 0 : -1}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/app/signup"
                    className="marketing-mobile-menu-cta"
                    onClick={() => {
                      logMarketingCtaClick("nav_signup");
                      setMenuOpen(false);
                    }}
                    tabIndex={menuOpen ? 0 : -1}
                  >
                    Signup
                  </Link>
                </div>
                <div className="marketing-mobile-menu-social" aria-label="Social media">
                  <a href="https://www.linkedin.com/company/build-ezy-india/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" tabIndex={menuOpen ? 0 : -1}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.2H3.2V21h3.3V8.2ZM4.85 3A1.92 1.92 0 1 0 4.84 6.84 1.92 1.92 0 0 0 4.85 3ZM21 13.65c0-3.86-2.06-5.66-4.81-5.66a4.15 4.15 0 0 0-3.75 2.06V8.2H9.13V21h3.31v-6.34c0-1.67.32-3.29 2.39-3.29 2.04 0 2.06 1.91 2.06 3.4V21H21v-7.35Z" /></svg>
                  </a>
                  <a href="https://x.com/getbuildezy" target="_blank" rel="noopener noreferrer" aria-label="X" tabIndex={menuOpen ? 0 : -1}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-6.4L6.45 22H3.33l7.27-8.31L2.95 2h6.41l4.43 5.86L18.9 2Zm-1.1 17.84h1.73L8.42 4.05H6.57L17.8 19.84Z" /></svg>
                  </a>
                  <a href="https://www.instagram.com/buildezy.ai/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" tabIndex={menuOpen ? 0 : -1}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.3 2h9.4A5.3 5.3 0 0 1 22 7.3v9.4a5.3 5.3 0 0 1-5.3 5.3H7.3A5.3 5.3 0 0 1 2 16.7V7.3A5.3 5.3 0 0 1 7.3 2Zm-.18 2A3.12 3.12 0 0 0 4 7.12v9.76A3.12 3.12 0 0 0 7.12 20h9.76A3.12 3.12 0 0 0 20 16.88V7.12A3.12 3.12 0 0 0 16.88 4H7.12Zm10.13 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /></svg>
                  </a>
                </div>
                <p className="marketing-mobile-menu-note">Design. Launch. Sell. Grow.</p>
              </nav>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
