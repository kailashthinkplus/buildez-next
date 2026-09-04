"use client";

import { useEffect, useRef } from "react";

/**
 * The generated React app runs as a client-routed SPA inside this
 * iframe (see v12PublishedBundle.ts) — internal navigation (a visitor
 * clicking a link to another page) only ever changes the iframe's own
 * location, never the parent tab's address bar. That breaks refresh,
 * back/forward, and sharing a link to anything but whichever page
 * happened to load first.
 *
 * v12PublishedBundle.ts's injected bootstrap script already tracks the
 * iframe's own SPA navigation (it needed to, to apply per-page custom
 * code) and now also posts the resulting page slug up to us. We turn
 * that into a real address-bar change via history.pushState — no
 * Next.js navigation, no iframe remount, just the visible URL catching
 * up to what's already on screen.
 */
export function PublishedV12Frame(props: {
  iframePath: string;
  title: string;
  currentPageSlug: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const currentSlug = props.currentPageSlug === "home" ? "" : props.currentPageSlug;
    const pathname = window.location.pathname;
    const suffix = currentSlug ? `/${currentSlug}` : "";
    const basePathname = suffix && pathname.endsWith(suffix)
      ? pathname.slice(0, pathname.length - suffix.length) || "/"
      : pathname;

    function pathnameForSlug(slug: string) {
      const normalized = slug === "home" || !slug ? "" : slug.replace(/^\/+|\/+$/g, "");
      if (!normalized) return basePathname;
      return basePathname === "/" ? `/${normalized}` : `${basePathname}/${normalized}`;
    }

    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data as { type?: unknown; slug?: unknown } | null;
      if (!data || data.type !== "BUILDEZ_PUBLISHED_NAV" || typeof data.slug !== "string") return;
      const nextPathname = pathnameForSlug(data.slug);
      if (nextPathname !== window.location.pathname) {
        window.history.pushState({ buildezV12Slug: data.slug }, "", `${nextPathname}${window.location.search}`);
      }
    }

    // Back/forward: re-resolving which site/page a pathname belongs to is a
    // server-side concern (custom domains, verified-domain overrides, etc.),
    // so a real navigation is the correct fix here, not another postMessage
    // round trip — this iframe's own content is already stale for whatever
    // the user just navigated back/forward to.
    function handlePopState() {
      window.location.reload();
    }

    window.addEventListener("message", handleMessage);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [props.currentPageSlug]);

  return (
    <iframe
      ref={iframeRef}
      title={props.title}
      src={props.iframePath}
      className="h-full w-full border-0"
    />
  );
}
