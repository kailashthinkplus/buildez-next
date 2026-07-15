#!/usr/bin/env python3

from __future__ import annotations

import datetime
import shutil
from pathlib import Path


ROOT = Path("/Users/kailash/buildez")
TARGET = (
    ROOT
    / "apps/web-app/modules/builder-v2/workspace/BuilderShell.tsx"
)


def replace_once(source: str, old: str, new: str, label: str) -> str:
    count = source.count(old)

    if count != 1:
        raise RuntimeError(
            f"{label}: expected exactly one matching block, found {count}"
        )

    return source.replace(old, new, 1)


def main() -> None:
    if not TARGET.exists():
        raise FileNotFoundError(f"Missing target file: {TARGET}")

    source = TARGET.read_text(encoding="utf-8")

    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = TARGET.with_name(
        f"{TARGET.name}.rc4-canvas-polish-{timestamp}.bak"
    )
    shutil.copy2(TARGET, backup)

    old_geometry = '''const measuredCanvasWidth = Math.max(canvasWidth, canvasContentWidth);
const scaledCanvasWidth = measuredCanvasWidth * canvasScale;
const scaledCanvasHeight = canvasContentHeight * canvasScale;
const canvasScrollWidth =
  canvasChromeLeftInset + scaledCanvasWidth + canvasChromeRightInset + CANVAS_EDGE_GUTTER * 2;
const canvasScrollHeight = Math.max(scaledCanvasHeight + CANVAS_EDGE_GUTTER * 2, 0);
const canvasVisibleLaneOffset =
  canvasChromeLeftInset + canvasChromeRightInset;
'''

    new_geometry = '''const measuredCanvasWidth = Math.max(
  canvasWidth,
  canvasContentWidth
);
const scaledCanvasWidth =
  measuredCanvasWidth * canvasScale;
const scaledCanvasHeight =
  canvasContentHeight * canvasScale;

/*
 * The Builder sidebars overlay the canvas viewport. The visible editing
 * lane is therefore the viewport width minus the active left and right
 * chrome. Keep enough intrinsic width for those chrome areas, the canvas,
 * and edge breathing room.
 */
const canvasVisibleLaneOffset =
  canvasChromeLeftInset + canvasChromeRightInset;
const canvasScrollWidth =
  canvasChromeLeftInset +
  scaledCanvasWidth +
  canvasChromeRightInset +
  CANVAS_EDGE_GUTTER * 2;
const canvasScrollHeight = Math.max(
  scaledCanvasHeight + CANVAS_EDGE_GUTTER * 2,
  0
);
'''

    source = replace_once(
        source,
        old_geometry,
        new_geometry,
        "canvas geometry",
    )

    old_wheel_effect = '''useEffect(() => {
  const viewport = canvasViewportRef.current;
  if (!viewport) return;
  const onWheel = (event: WheelEvent) => {
    if (!event.shiftKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    viewport.scrollLeft += event.deltaY;
  };
  viewport.addEventListener("wheel", onWheel, { passive: false });
  return () => {
    viewport.removeEventListener("wheel", onWheel);
  };
}, []);
'''

    new_wheel_effect = '''useEffect(() => {
  const viewport = canvasViewportRef.current;
  if (!viewport) return;

  const onWheel = (event: WheelEvent) => {
    if (
      !event.shiftKey ||
      Math.abs(event.deltaY) <= Math.abs(event.deltaX)
    ) {
      return;
    }

    event.preventDefault();
    viewport.scrollLeft += event.deltaY;
  };

  viewport.addEventListener(
    "wheel",
    onWheel,
    { passive: false }
  );

  return () => {
    viewport.removeEventListener(
      "wheel",
      onWheel
    );
  };
}, []);

/*
 * Keep the canvas centred in the lane that is actually visible between
 * Builder chrome. When the scaled canvas is wider than that lane, centre
 * the initial horizontal viewport without removing normal user scrolling.
 */
useEffect(() => {
  const viewport = canvasViewportRef.current;
  if (!viewport) return;

  const frame = window.requestAnimationFrame(() => {
    const visibleLaneWidth = Math.max(
      0,
      viewport.clientWidth -
        canvasChromeLeftInset -
        canvasChromeRightInset
    );

    if (
      visibleLaneWidth <= 0 ||
      scaledCanvasWidth <= visibleLaneWidth
    ) {
      viewport.scrollLeft = 0;
      return;
    }

    const canvasCentre =
      CANVAS_EDGE_GUTTER +
      canvasChromeLeftInset +
      scaledCanvasWidth / 2;

    const visibleLaneCentre =
      canvasChromeLeftInset +
      visibleLaneWidth / 2;

    viewport.scrollLeft = Math.max(
      0,
      canvasCentre - visibleLaneCentre
    );
  });

  return () => {
    window.cancelAnimationFrame(frame);
  };
}, [
  device,
  zoom,
  scaledCanvasWidth,
  canvasChromeLeftInset,
  canvasChromeRightInset,
]);
'''

    source = replace_once(
        source,
        old_wheel_effect,
        new_wheel_effect,
        "canvas wheel and centring effects",
    )

    old_workspace = '''    <div
      className="relative min-h-full p-6"
      style={{
        minWidth: `max(100%, ${canvasScrollWidth}px)`,
        minHeight: `${canvasScrollHeight}px`,
      }}
    >
      <div
        className="relative flex shrink-0 justify-center"
        style={{
          marginLeft: `${canvasChromeLeftInset}px`,
          marginRight: `${canvasChromeRightInset}px`,
          width: `calc(100% - ${canvasVisibleLaneOffset}px)`,
          minWidth: `${scaledCanvasWidth}px`,
          height: canvasContentHeight ? `${scaledCanvasHeight}px` : undefined,
        }}
      >
'''

    new_workspace = '''    <div
      className="relative min-h-full"
      style={{
        padding: `${CANVAS_EDGE_GUTTER}px`,
        minWidth: `max(100%, ${canvasScrollWidth}px)`,
        minHeight: `${canvasScrollHeight}px`,
      }}
    >
      <div
        className="relative flex shrink-0 justify-center"
        style={{
          marginLeft: `${canvasChromeLeftInset}px`,
          marginRight: `${canvasChromeRightInset}px`,
          width: `calc(100% - ${canvasVisibleLaneOffset}px)`,
          minWidth: `${scaledCanvasWidth}px`,
          height: canvasContentHeight
            ? `${scaledCanvasHeight}px`
            : undefined,
        }}
      >
'''

    source = replace_once(
        source,
        old_workspace,
        new_workspace,
        "canvas workspace",
    )

    old_scaled_wrapper = '''        <div
          className="relative shrink-0"
          style={{
            width: `${scaledCanvasWidth}px`,
            height: canvasContentHeight ? `${scaledCanvasHeight}px` : undefined,
          }}
        >
'''

    new_scaled_wrapper = '''        <div
          className="relative shrink-0 rounded-sm"
          style={{
            width: `${scaledCanvasWidth}px`,
            height: canvasContentHeight
              ? `${scaledCanvasHeight}px`
              : undefined,
            boxShadow:
              "0 24px 70px rgb(0 0 0 / 38%), " +
              "0 0 0 1px rgb(255 255 255 / 7%)",
          }}
        >
'''

    source = replace_once(
        source,
        old_scaled_wrapper,
        new_scaled_wrapper,
        "scaled canvas wrapper",
    )

    old_sandbox_class = '''            className="relative builder-canvas-sandbox"
'''

    new_sandbox_class = '''            className="relative overflow-hidden rounded-sm builder-canvas-sandbox"
'''

    source = replace_once(
        source,
        old_sandbox_class,
        new_sandbox_class,
        "canvas sandbox class",
    )

    TARGET.write_text(source, encoding="utf-8")

    print("RC-4 canvas visual polish applied.")
    print(f"Updated: {TARGET}")
    print(f"Backup:  {backup}")


if __name__ == "__main__":
    main()
