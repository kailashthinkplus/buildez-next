#!/usr/bin/env python3

from pathlib import Path
import shutil

drag_file = Path(
    "/Users/kailash/buildez/"
    "apps/web-app/playwright/helpers/builderDrag.ts"
)

spec_file = Path(
    "/Users/kailash/buildez/"
    "apps/web-app/playwright/tests/builder/operations/"
    "scroll-targeting.spec.ts"
)

for path in (drag_file, spec_file):
    if not path.exists():
        raise SystemExit(f"File not found: {path}")

shutil.copy2(
    drag_file,
    drag_file.with_suffix(".ts.visible-target.bak"),
)
shutil.copy2(
    spec_file,
    spec_file.with_suffix(".ts.visible-target.bak"),
)

drag_text = drag_file.read_text(encoding="utf-8")
spec_text = spec_file.read_text(encoding="utf-8")

helper_name = "dragPaletteWidgetIntoVisibleTarget"

helper = r'''
export async function dragPaletteWidgetIntoVisibleTarget(
  page: Page,
  widgetType: string,
  target: Locator,
) {
  await page.evaluate(() => {
    (window as any).__builderLastDropCommit = null;

    window.addEventListener(
      "builder:drop-commit",
      (event) => {
        (window as any).__builderLastDropCommit =
          (event as CustomEvent).detail;
      },
      { once: true },
    );
  });

  const source = page.getByTestId(
    `palette-widget-${widgetType}`,
  );
  const shell = page.getByTestId("builder-shell");
  const canvasViewport = page.locator(
    "[data-builder-canvas-scroll='true']",
  );

  await expect(source).toBeVisible();
  await expect(target).toBeVisible();
  await expect(canvasViewport).toBeVisible();

  const targetId = await target.getAttribute("data-node-id");

  expect(
    targetId,
    "visible drop target must expose its production node id",
  ).toBeTruthy();

  if (!targetId) {
    return;
  }

  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();
  const viewportBox = await canvasViewport.boundingBox();

  expect(sourceBox, "palette source must have a bounding box")
    .not.toBeNull();
  expect(targetBox, "visible target must have a bounding box")
    .not.toBeNull();
  expect(viewportBox, "canvas viewport must have a bounding box")
    .not.toBeNull();

  if (!sourceBox || !targetBox || !viewportBox) {
    return;
  }

  const start = {
    x: sourceBox.x + sourceBox.width / 2,
    y: sourceBox.y + sourceBox.height / 2,
  };

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();

  await page.mouse.move(
    start.x + 12,
    start.y,
    { steps: 5 },
  );

  await expect(shell).toHaveAttribute(
    "data-dnd-active-id",
    new RegExp(`^new:${widgetType}:`),
  );

  /*
   * Re-read geometry after drag activation because selection chrome,
   * drag ghost and canvas layout may change during dragstart.
   */
  const liveTarget = await target.boundingBox();
  const liveViewport = await canvasViewport.boundingBox();

  expect(liveTarget).not.toBeNull();
  expect(liveViewport).not.toBeNull();

  if (!liveTarget || !liveViewport) {
    await page.mouse.up();
    return;
  }

  /*
   * Use the target's visible left padding lane rather than its child
   * content. Clamp the point within the actual canvas viewport.
   */
  const targetX = Math.max(
    liveViewport.x + 40,
    Math.min(
      liveViewport.x + liveViewport.width - 40,
      liveTarget.x + Math.min(32, liveTarget.width / 3),
    ),
  );

  const targetY = Math.max(
    liveViewport.y + 60,
    Math.min(
      liveViewport.y + liveViewport.height - 60,
      liveTarget.y + liveTarget.height / 2,
    ),
  );

  await page.mouse.move(
    targetX,
    targetY,
    { steps: 32 },
  );

  await expect(shell).toHaveAttribute(
    "data-dnd-over-id",
    targetId,
  );
  await expect(shell).toHaveAttribute(
    "data-dnd-intent",
    "inside",
  );
  await expect(shell).toHaveAttribute(
    "data-dnd-valid",
    "true",
  );

  /*
   * Re-enter the current live target immediately before release so
   * the final production hit test uses current scroll geometry.
   */
  const releaseTarget = await target.boundingBox();
  const releaseViewport = await canvasViewport.boundingBox();

  expect(releaseTarget).not.toBeNull();
  expect(releaseViewport).not.toBeNull();

  if (!releaseTarget || !releaseViewport) {
    await page.mouse.up();
    return;
  }

  const releaseX = Math.max(
    releaseViewport.x + 40,
    Math.min(
      releaseViewport.x + releaseViewport.width - 40,
      releaseTarget.x + Math.min(32, releaseTarget.width / 3),
    ),
  );

  const releaseY = Math.max(
    releaseViewport.y + 60,
    Math.min(
      releaseViewport.y + releaseViewport.height - 60,
      releaseTarget.y + releaseTarget.height / 2,
    ),
  );

  await page.mouse.move(
    releaseX,
    releaseY,
    { steps: 4 },
  );

  await page.mouse.up();

  await expect(shell).toHaveAttribute(
    "data-dnd-active-id",
    "",
  );

  const committed = await page.evaluate(
    () => (window as any).__builderLastDropCommit,
  );

  expect(
    committed,
    "visible palette drop must reach production commit handler",
  ).toBeTruthy();

  expect(committed.targetParentId).toBe(targetId);
  expect(committed.intent).toBe("inside");
}
'''

if helper_name not in drag_text:
    drag_text = drag_text.rstrip() + "\n\n" + helper.strip() + "\n"
else:
    print(
        f"{helper_name} already exists; helper was not duplicated."
    )

old_import = (
    'import { dragPaletteWidgetInside } '
    'from "../../../helpers/builderDrag";'
)

new_import = (
    'import { dragPaletteWidgetIntoVisibleTarget } '
    'from "../../../helpers/builderDrag";'
)

if old_import in spec_text:
    spec_text = spec_text.replace(
        old_import,
        new_import,
        1,
    )
elif helper_name not in spec_text:
    raise SystemExit(
        "Expected scroll-test drag import was not found. "
        "No spec change was applied."
    )

old_call = (
    'await dragPaletteWidgetInside(page, "heading", target);'
)

new_call = (
    'await dragPaletteWidgetIntoVisibleTarget('
    'page, "heading", target);'
)

if old_call in spec_text:
    spec_text = spec_text.replace(
        old_call,
        new_call,
        1,
    )
elif new_call not in spec_text:
    raise SystemExit(
        "Expected scroll-test drag invocation was not found."
    )

drag_file.write_text(drag_text, encoding="utf-8")
spec_file.write_text(spec_text, encoding="utf-8")

print("✓ Added visible-target palette drag helper")
print("✓ Updated scroll test to use the new helper")
print("✓ Production Builder files were not changed")
