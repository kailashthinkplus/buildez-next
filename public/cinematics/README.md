# Cinematic frame sequences

Each subfolder here is one `<CinematicSequence>` scene, driven by scroll
position through the `StickyScene` primitive (`app/components/motion/StickyScene.tsx`).

## Folder layout

```
/public/cinematics/<scene-id>/
  manifest.json
  desktop/frame-0001.avif  frame-0001.webp  ...
  mobile/frame-0001.avif   frame-0001.webp  ...   (optional)
```

## manifest.json

```json
{
  "id": "design-launch-sell-grow",
  "frameCount": 240,
  "width": 1920,
  "height": 1080,
  "desktop": "/cinematics/design-launch-sell-grow/desktop/frame-{frame}.avif",
  "desktopFallback": "/cinematics/design-launch-sell-grow/desktop/frame-{frame}.webp",
  "mobile": "/cinematics/design-launch-sell-grow/mobile/frame-{frame}.avif",
  "mobileFallback": "/cinematics/design-launch-sell-grow/mobile/frame-{frame}.webp"
}
```

`{frame}` is replaced with the 1-indexed frame number, zero-padded to 4
digits (`frame-0001.avif` … `frame-0240.avif`). `mobile`/`mobileFallback`
are optional — when omitted, the component uses the desktop sequence at
every viewport width.

## Required frame spec for a real render

- **Format:** AVIF primary, WebP fallback (the component picks AVIF when
  the browser supports it, WebP otherwise — both are produced by the
  script below).
- **Resolution:** 1920×1080 for desktop, 1080×1350 (or similar portrait
  crop) for mobile if a mobile sequence is supplied.
- **Frame count:** 120–240 frames per scene is a good range — enough for
  smooth progression across a `scrollLength` of 300–550vh without either
  visible stepping or an excessive download budget.
- **Naming:** `frame-0001.ext` … `frame-NNNN.ext`, no gaps, 1-indexed.

## Converting a source video

```bash
./scripts/video-to-frames.sh input.mp4 design-launch-sell-grow --width 1920 --height 1080 --fps 30
```

See `scripts/video-to-frames.sh --help` for all options. It extracts
frames with ffmpeg, then encodes AVIF + WebP for both `desktop/` (and,
if `--mobile-crop` is passed, `mobile/`).

## Current placeholder scenes

- `design-launch-sell-grow/` — 4 frames only, generated directly from the
  existing stage screenshots (`frame-design.png`, `frame-brand.png`,
  `frame-commerce.png`, `frame-grow.png`) at the repo root. This makes the
  Design → Launch → Sell → Grow transition scene's background sequence
  functionally real today; it will read as 4 hard cuts rather than a
  smooth camera move until a proper multi-frame render replaces it.
