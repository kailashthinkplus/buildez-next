#!/usr/bin/env bash
# Convert a source video into a CinematicSequence-ready AVIF/WebP frame set.
#
# Usage:
#   ./scripts/video-to-frames.sh <input.mp4> <scene-id> [options]
#
# Options:
#   --width N         Output frame width (default: 1920)
#   --height N        Output frame height (default: 1080)
#   --fps N           Frames per second to extract (default: 24)
#   --quality-avif N  AVIF quality, 0-100 (default: 58)
#   --quality-webp N  WebP quality, 0-100 (default: 72)
#   --mobile-crop WxH Also produce a mobile/ set cropped to WxH (e.g. 1080x1350)
#   --out DIR         Output root (default: public/cinematics)
#
# Requires: ffmpeg, and either `avifenc`+`cwebp` (libavif/libwebp) or
# ImageMagick (`magick`) as a fallback for both formats.
#
# Example:
#   ./scripts/video-to-frames.sh renders/hero-final.mov hero \
#     --width 1920 --height 1080 --fps 30 --mobile-crop 1080x1350

set -euo pipefail

INPUT="${1:-}"
SCENE="${2:-}"
if [[ -z "$INPUT" || -z "$SCENE" ]]; then
  sed -n '3,20p' "$0"
  exit 1
fi
shift 2

WIDTH=1920
HEIGHT=1080
FPS=24
Q_AVIF=58
Q_WEBP=72
MOBILE_CROP=""
OUT_ROOT="public/cinematics"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --width) WIDTH="$2"; shift 2 ;;
    --height) HEIGHT="$2"; shift 2 ;;
    --fps) FPS="$2"; shift 2 ;;
    --quality-avif) Q_AVIF="$2"; shift 2 ;;
    --quality-webp) Q_WEBP="$2"; shift 2 ;;
    --mobile-crop) MOBILE_CROP="$2"; shift 2 ;;
    --out) OUT_ROOT="$2"; shift 2 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required. Install it (e.g. 'brew install ffmpeg') and re-run." >&2
  exit 1
fi

HAVE_AVIFENC=0; command -v avifenc >/dev/null 2>&1 && HAVE_AVIFENC=1
HAVE_CWEBP=0; command -v cwebp >/dev/null 2>&1 && HAVE_CWEBP=1
HAVE_MAGICK=0; command -v magick >/dev/null 2>&1 && HAVE_MAGICK=1

if [[ $HAVE_AVIFENC -eq 0 && $HAVE_MAGICK -eq 0 ]]; then
  echo "Need avifenc or ImageMagick (magick) for AVIF encoding." >&2
  exit 1
fi
if [[ $HAVE_CWEBP -eq 0 && $HAVE_MAGICK -eq 0 ]]; then
  echo "Need cwebp or ImageMagick (magick) for WebP encoding." >&2
  exit 1
fi

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

encode_set () {
  local png_dir="$1" out_dir="$2"
  mkdir -p "$out_dir"
  for png in "$png_dir"/frame-*.png; do
    local base
    base="$(basename "$png" .png)"
    if [[ $HAVE_AVIFENC -eq 1 ]]; then
      avifenc -q "$Q_AVIF" -a end-usage=q -a cq-level=26 "$png" "$out_dir/$base.avif" >/dev/null
    else
      magick "$png" -quality "$Q_AVIF" "$out_dir/$base.avif"
    fi
    if [[ $HAVE_CWEBP -eq 1 ]]; then
      cwebp -q "$Q_WEBP" "$png" -o "$out_dir/$base.webp" >/dev/null 2>&1
    else
      magick "$png" -quality "$Q_WEBP" "$out_dir/$base.webp"
    fi
  done
}

echo "Extracting desktop frames (${WIDTH}x${HEIGHT} @ ${FPS}fps)..."
DESK_PNG="$WORK_DIR/desktop"
mkdir -p "$DESK_PNG"
ffmpeg -y -i "$INPUT" -vf "fps=$FPS,scale=$WIDTH:$HEIGHT:force_original_aspect_ratio=increase,crop=$WIDTH:$HEIGHT" \
  "$DESK_PNG/frame-%04d.png" -loglevel error

echo "Encoding desktop AVIF + WebP..."
encode_set "$DESK_PNG" "$OUT_ROOT/$SCENE/desktop"

FRAME_COUNT="$(find "$DESK_PNG" -name 'frame-*.png' | wc -l | tr -d ' ')"

if [[ -n "$MOBILE_CROP" ]]; then
  MW="${MOBILE_CROP%x*}"
  MH="${MOBILE_CROP#*x}"
  echo "Extracting mobile frames (${MW}x${MH})..."
  MOB_PNG="$WORK_DIR/mobile"
  mkdir -p "$MOB_PNG"
  ffmpeg -y -i "$INPUT" -vf "fps=$FPS,scale=$MW:$MH:force_original_aspect_ratio=increase,crop=$MW:$MH" \
    "$MOB_PNG/frame-%04d.png" -loglevel error
  echo "Encoding mobile AVIF + WebP..."
  encode_set "$MOB_PNG" "$OUT_ROOT/$SCENE/mobile"
fi

MANIFEST="$OUT_ROOT/$SCENE/manifest.json"
{
  echo "{"
  echo "  \"id\": \"$SCENE\","
  echo "  \"frameCount\": $FRAME_COUNT,"
  echo "  \"width\": $WIDTH,"
  echo "  \"height\": $HEIGHT,"
  echo "  \"desktop\": \"/cinematics/$SCENE/desktop/frame-{frame}.avif\","
  echo "  \"desktopFallback\": \"/cinematics/$SCENE/desktop/frame-{frame}.webp\"$([[ -n "$MOBILE_CROP" ]] && echo ",")"
  if [[ -n "$MOBILE_CROP" ]]; then
    echo "  \"mobile\": \"/cinematics/$SCENE/mobile/frame-{frame}.avif\","
    echo "  \"mobileFallback\": \"/cinematics/$SCENE/mobile/frame-{frame}.webp\""
  fi
  echo "}"
} > "$MANIFEST"

echo ""
echo "Done: $FRAME_COUNT frames -> $OUT_ROOT/$SCENE/"
echo "Manifest written to $MANIFEST"
