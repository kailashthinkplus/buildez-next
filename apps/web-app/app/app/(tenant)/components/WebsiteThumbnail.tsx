"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type WebsiteThumbnailProps = {
  siteId: string;
  siteName: string;
  siteStatus?: string;
  className?: string;
};

export function WebsiteThumbnail({ siteId, siteName, siteStatus, className = "" }: WebsiteThumbnailProps) {
  const [previewReady, setPreviewReady] = useState(false);
  const inspectionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldLoadPublishedPreview = !siteStatus || siteStatus.toUpperCase() === "PUBLISHED";

  useEffect(() => {
    setPreviewReady(false);
    return () => {
      if (inspectionTimer.current) clearTimeout(inspectionTimer.current);
    };
  }, [siteId, siteStatus]);

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
    }, 500);
  }

  return (
    <div className={`relative overflow-hidden bg-slate-900 ${className}`}>
      <GenericWebsiteThumbnail />
      {shouldLoadPublishedPreview ? <iframe
        key={siteId}
        src={`/published-preview/${encodeURIComponent(siteId)}`}
        title={`${siteName} website thumbnail`}
        loading="lazy"
        tabIndex={-1}
        aria-hidden="true"
        onLoad={(event) => inspectPreview(event.currentTarget)}
        onError={() => setPreviewReady(false)}
        className={`pointer-events-none absolute left-0 top-0 h-[720px] w-[1200px] origin-top-left scale-[0.4] border-0 bg-white transition-opacity duration-300 ${previewReady ? "opacity-100" : "opacity-0"}`}
        sandbox="allow-scripts allow-same-origin"
      /> : null}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
    </div>
  );
}

function GenericWebsiteThumbnail() {
  return (
    <div className="absolute inset-0 bg-[#f4f7fb]">
      <Image
        src="/theme-previews/buildez-default.png"
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 420px"
        className="object-cover"
        priority={false}
      />
    </div>
  );
}
