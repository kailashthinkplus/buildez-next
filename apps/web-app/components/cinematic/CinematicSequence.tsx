"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import StickyScene from "@/components/motion/StickyScene";
import { prefersReducedMotion } from "@/lib/motion";
import { resolveFramePath, type CinematicManifest } from "./types";

let avifSupport: Promise<boolean> | null = null;
/** Tiny known-valid AVIF probe image — standard feature-detection technique. */
function supportsAvif(): Promise<boolean> {
  if (avifSupport) return avifSupport;
  avifSupport = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width > 0);
    img.onerror = () => resolve(false);
    img.src =
      "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=";
  });
  return avifSupport;
}

type Fit = "cover" | "contain";

type Props = {
  manifest: CinematicManifest;
  /** Controlled mode: an externally-driven 0..1 progress (e.g. from a parent StickyScene). */
  progress?: number;
  /** Standalone mode: pins itself for this scroll distance and drives its own progress. */
  scrollLength?: string;
  fit?: Fit;
  className?: string;
};

function CanvasPlayer({
  manifest,
  progress,
  fit = "cover",
  posterSrc,
}: {
  manifest: CinematicManifest;
  progress: number;
  fit?: Fit;
  posterSrc?: string;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [useAvif, setUseAvif] = useState(true);
  const [firstFrameReady, setFirstFrameReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    supportsAvif().then(setUseAvif);
  }, []);

  const urls = useMemo(() => {
    const desktopPattern = useAvif ? manifest.desktop : manifest.desktopFallback ?? manifest.desktop;
    const mobilePattern = isMobile ? (useAvif ? manifest.mobile : manifest.mobileFallback) ?? manifest.mobile : undefined;
    const pattern = mobilePattern ?? desktopPattern;
    return Array.from({ length: manifest.frameCount }, (_, i) => resolveFramePath(pattern, i));
  }, [manifest, isMobile, useAvif]);

  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(-1);
  const [frontIsA, setFrontIsA] = useState(true);

  const drawFrame = useCallback(
    (canvas: HTMLCanvasElement | null, img: HTMLImageElement | null) => {
      if (!canvas || !img || !canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.parentElement.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = w / h;
      let dw = w;
      let dh = h;
      let dx = 0;
      let dy = 0;
      const useCover = fit === "cover";
      if ((useCover && ir > cr) || (!useCover && ir < cr)) {
        dh = h;
        dw = h * ir;
        dx = (w - dw) / 2;
      } else {
        dw = w;
        dh = w / ir;
        dy = (h - dh) / 2;
      }
      ctx.drawImage(img, dx, dy, dw, dh);
    },
    [fit]
  );

  // Preload: current frame first, then neighbors, then the rest in idle chunks.
  useEffect(() => {
    let cancelled = false;
    imagesRef.current = [];
    activeIndexRef.current = -1;
    setFirstFrameReady(false);

    const targetIndex = Math.max(0, Math.min(manifest.frameCount - 1, Math.round(progress * (manifest.frameCount - 1))));

    const load = (i: number) =>
      new Promise<void>((resolve) => {
        if (imagesRef.current[i] || !urls[i]) return resolve();
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          if (!cancelled) imagesRef.current[i] = img;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = urls[i];
      });

    (async () => {
      await load(targetIndex);
      if (cancelled) return;
      const targetImg = imagesRef.current[targetIndex];
      drawFrame(canvasARef.current, targetImg);
      activeIndexRef.current = targetIndex;
      if (targetImg) setFirstFrameReady(true);

      const near = [targetIndex - 1, targetIndex + 1, targetIndex - 2, targetIndex + 2].filter(
        (i) => i >= 0 && i < manifest.frameCount
      );
      for (const i of near) await load(i);
      if (cancelled) return;

      const rest = Array.from({ length: manifest.frameCount }, (_, i) => i).filter((i) => !imagesRef.current[i]);
      let idx = 0;
      const idle: (cb: () => void) => void =
        typeof window.requestIdleCallback === "function" ? window.requestIdleCallback.bind(window) : (cb) => setTimeout(cb, 120);
      const step = () => {
        if (cancelled || idx >= rest.length) return;
        const chunk = rest.slice(idx, idx + 3);
        idx += 3;
        Promise.all(chunk.map(load)).then(() => idle(step));
      };
      idle(step);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls, manifest.frameCount]);

  // Advance frame + crossfade when progress moves to a new frame index.
  useEffect(() => {
    const targetIndex = Math.max(0, Math.min(manifest.frameCount - 1, Math.round(progress * (manifest.frameCount - 1))));
    if (targetIndex === activeIndexRef.current) return;
    const img = imagesRef.current[targetIndex];
    if (!img) return;
    const backCanvas = frontIsA ? canvasBRef.current : canvasARef.current;
    drawFrame(backCanvas, img);
    activeIndexRef.current = targetIndex;
    setFrontIsA((v) => !v);
    setFirstFrameReady(true);
  }, [progress, manifest.frameCount, frontIsA, drawFrame]);

  // Redraw the active frame on resize.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const i = activeIndexRef.current;
      if (i >= 0) {
        drawFrame(canvasARef.current, imagesRef.current[i]);
        drawFrame(canvasBRef.current, imagesRef.current[i]);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [drawFrame]);

  return (
    <div ref={containerRef} className="cine-canvas-wrap">
      {posterSrc && !firstFrameReady && (
        <img src={posterSrc} alt="" aria-hidden="true" className="cine-poster" style={{ objectFit: fit }} />
      )}
      <canvas ref={canvasARef} className="cine-canvas" style={{ opacity: frontIsA ? 1 : 0 }} />
      <canvas ref={canvasBRef} className="cine-canvas" style={{ opacity: frontIsA ? 0 : 1 }} />
    </div>
  );
}

/**
 * Scroll-driven image-sequence player. Preloads progressively, draws to
 * canvas (DPR-capped), and crossfades between frames to avoid visible
 * jumping. Pass `progress` to drive it from a parent StickyScene, or
 * `scrollLength` to let it pin and drive itself.
 *
 * Failure fallback chain: poster (shown until the first frame decodes, and
 * left in place if every frame request fails) -> reduced-motion static
 * frame -> the section's own dark background (canvases paint nothing and
 * stay transparent, never a blank white box or a stuck spinner).
 */
export default function CinematicSequence({ manifest, progress, scrollLength = "300vh", fit = "cover", className }: Props) {
  if (prefersReducedMotion()) {
    const mid = Math.floor(manifest.frameCount / 2);
    const src = manifest.poster ?? resolveFramePath(manifest.desktopFallback ?? manifest.desktop, mid);
    return (
      <div className={className}>
        <img src={src} alt="" className="cine-static" />
      </div>
    );
  }

  if (progress !== undefined) {
    return (
      <div className={className}>
        <CanvasPlayer manifest={manifest} progress={progress} fit={fit} posterSrc={manifest.poster} />
      </div>
    );
  }

  return (
    <StickyScene length={scrollLength} className={className}>
      {(p) => <CanvasPlayer manifest={manifest} progress={p} fit={fit} posterSrc={manifest.poster} />}
    </StickyScene>
  );
}
