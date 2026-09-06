"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useGlobalScrollFx } from "@/components/motion/primitives";
import { logMarketingCtaClick } from "@/modules/legal/MarketingAnalytics";
import { Arrow } from "./Arrow";

export function HomeNav() {
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);

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
    setMenuMounted(true);
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
          <a href="/pricing">Pricing</a>
          <a href="#difference">Why Build Ezy</a>
          <a href="#workflow">How it works</a>
        </div>
        <div className="nav-actions">
          <a href="/app/login" className="login-link" onClick={() => logMarketingCtaClick("nav_login")}>
            Log In
          </a>
          <a href="/app/signup" className="mini-cta" onClick={() => logMarketingCtaClick("nav_signup")}>
            Signup <Arrow />
          </a>
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
                <a href="#top" className="marketing-mobile-menu-brand" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>
                  <img src="/buildez-logo-dark.svg" alt="BuildEzy" />
                </a>
                <a href="#platform" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>Platform</a>
                <a href="/pricing" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>Pricing</a>
                <a href="#difference" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>Why Build Ezy</a>
                <a href="#workflow" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>How it works</a>
                <div className="marketing-mobile-menu-divider" />
                <a
                  href="/app/login"
                  onClick={() => {
                    logMarketingCtaClick("nav_login");
                    setMenuOpen(false);
                  }}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  Log in
                </a>
                <a
                  href="/app/signup"
                  className="marketing-mobile-menu-cta"
                  onClick={() => {
                    logMarketingCtaClick("nav_signup");
                    setMenuOpen(false);
                  }}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  Signup
                </a>
              </nav>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
