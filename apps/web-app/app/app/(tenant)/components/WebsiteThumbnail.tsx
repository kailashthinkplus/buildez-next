"use client";

import { useEffect, useRef, useState } from "react";

type WebsiteThumbnailProps = {
  siteId: string;
  siteName: string;
  siteStatus?: string;
  siteSlug?: string;
  pageId?: string;
  pageSlug?: string;
  updatedAt?: string;
  hasMeaningfulPreview?: boolean;
  renderMode?: string;
  className?: string;
};

type PreviewDetails = {
  meaningful: boolean;
  previewUrl: string | null;
  version: number;
  inspectable?: boolean;
};

export function WebsiteThumbnail({ siteId, siteName, siteSlug, pageId, pageSlug, updatedAt, hasMeaningfulPreview, renderMode, className = "" }: WebsiteThumbnailProps) {
  const usesProjectPreview = renderMode === "REACT" && Boolean(pageId && pageSlug && hasMeaningfulPreview);
  const directUrl = !usesProjectPreview && siteSlug && pageId && pageSlug && hasMeaningfulPreview
    ? `/preview/${encodeURIComponent(siteSlug)}/${encodeURIComponent(pageSlug)}`
    : null;
  const [details, setDetails] = useState<PreviewDetails | null>(directUrl ? { meaningful: true, previewUrl: directUrl, version: Date.parse(updatedAt || "") || Date.now() } : null);
  const [previewReady, setPreviewReady] = useState(false);
  const inspectionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPreviewReady(false);
    if (directUrl) {
      setDetails({ meaningful: true, previewUrl: directUrl, version: Date.parse(updatedAt || "") || Date.now() });
      return;
    }
    if (usesProjectPreview && pageSlug) {
      const controller = new AbortController();
      fetch("/api/builder-v3/preview/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ siteId }),
        signal: controller.signal,
      })
        .then(async (response) => {
          const payload = await response.json();
          if (!response.ok) throw new Error("Page preview failed to start");
          const preview = payload?.data && typeof payload.data === "object" ? payload.data : payload;
          if (typeof preview?.url !== "string") throw new Error("Page preview returned an invalid URL");
          const url = new URL(preview.url);
          url.pathname = pageSlug === "home" ? "/" : `/${pageSlug.replace(/^\/+|\/+$/g, "")}`;
          return url.toString();
        })
        .then((previewUrl) => setDetails({
          meaningful: true,
          previewUrl,
          version: Date.parse(updatedAt || "") || Date.now(),
          inspectable: false,
        }))
        .catch(() => {
          if (!controller.signal.aborted) setDetails({ meaningful: false, previewUrl: null, version: 0 });
        });
      return () => controller.abort();
    }
    if (hasMeaningfulPreview === false && pageId) {
      setDetails({ meaningful: false, previewUrl: null, version: Date.parse(updatedAt || "") || 0 });
      return;
    }
    const controller = new AbortController();
    fetch(`/api/sites/${encodeURIComponent(siteId)}/preview`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => response.ok ? response.json() : null)
      .then((payload) => { if (payload) setDetails(payload); })
      .catch(() => undefined);
    return () => controller.abort();
  }, [directUrl, hasMeaningfulPreview, pageId, pageSlug, siteId, updatedAt, usesProjectPreview]);

  useEffect(() => () => {
    if (inspectionTimer.current) clearTimeout(inspectionTimer.current);
  }, []);

  function inspectPreview(frame: HTMLIFrameElement) {
    if (inspectionTimer.current) clearTimeout(inspectionTimer.current);
    inspectionTimer.current = setTimeout(() => {
      try {
        const document = frame.contentDocument;
        const body = document?.body;
        const text = body?.innerText.trim().toLowerCase() ?? "";
        const hasVisualContent = Boolean(body?.querySelector("main, section, header, img, svg, video, canvas, [data-buildez-node]"));
        const failed = text.includes("404")
          || text.includes("not found")
          || text.includes("could not be found")
          || text.includes("preview unavailable")
          || text.includes("site not found");
        setPreviewReady(Boolean(body && !failed && (text.length > 20 || hasVisualContent)));
      } catch {
        setPreviewReady(false);
      }
    }, 600);
  }

  const source = details?.meaningful && details.previewUrl
    ? `${details.previewUrl}${details.previewUrl.includes("?") ? "&" : "?"}v=${details.version}`
    : null;

  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-900 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/website-placeholder.svg" alt={`${siteName} website preview placeholder`} className="absolute inset-0 h-full w-full object-cover" />
      {source ? <iframe
        key={source}
        src={source}
        title={`${siteName} website thumbnail`}
        loading="lazy"
        tabIndex={-1}
        aria-hidden="true"
        onLoad={(event) => details?.inspectable === false ? setPreviewReady(true) : inspectPreview(event.currentTarget)}
        onError={() => setPreviewReady(false)}
        className={`pointer-events-none absolute left-0 top-0 h-[250%] w-[250%] origin-top-left scale-[0.4] border-0 bg-white transition-opacity duration-300 ${previewReady ? "opacity-100" : "opacity-0"}`}
        sandbox="allow-scripts allow-same-origin"
      /> : null}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/10" />
    </div>
  );
}
