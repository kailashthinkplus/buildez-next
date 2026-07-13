import { expect, type Locator, type Page } from "@playwright/test";

type DropPosition = "before" | "after" | "inside";

export async function dragBuilderNode(
  page: Page,
  source: Locator,
  target: Locator,
  position: DropPosition = "inside"
) {
  await expect(source).toBeVisible();
  await expect(target).toBeVisible();
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();
  expect(sourceBox, "drag source must have a browser bounding box").not.toBeNull();
  expect(targetBox, "drop target must have a browser bounding box").not.toBeNull();
  if (!sourceBox || !targetBox) return;

  const targetPosition = {
    // Use the visual centre for inside drops. The old 8px inset could sit
    // underneath the Builder's fixed left chrome after Playwright scrolled a
    // wide canvas target into view, causing dragTo to retry until timeout.
    x: position === "inside" ? Math.min(8, targetBox.width / 2) : targetBox.width / 2,
    y:
    position === "before"
      ? 3
      : position === "after"
        ? targetBox.height - 3
        : targetBox.height / 2,
  };

  const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
  await source.dispatchEvent("dragstart", { dataTransfer });
  await target.dispatchEvent("dragover", {
    dataTransfer,
    clientX: targetBox.x + targetPosition.x,
    clientY: targetBox.y + targetPosition.y,
  });
  await target.dispatchEvent("drop", {
    dataTransfer,
    clientX: targetBox.x + targetPosition.x,
    clientY: targetBox.y + targetPosition.y,
  });
  await source.dispatchEvent("dragend", { dataTransfer });
  await dataTransfer.dispose();
  await expect(page.getByTestId("builder-drop-indicator")).toHaveCount(0);
}

export async function dragSelectedNodeByHandle(
  page: Page,
  nodeId: string,
  target: Locator,
) {
  const shell = page.getByTestId("builder-shell");
  const handle = page.getByTestId("builder-node-drag-handle");
  await expect(handle).toHaveAttribute("data-drag-node-id", nodeId);
  await expect(target).toBeVisible();

  const viewport = page.locator("[data-builder-canvas-scroll='true']");
  const sourceBeforeScroll = await handle.boundingBox();
  const viewportSize = page.viewportSize();
  expect(sourceBeforeScroll, "drag handle must have a browser bounding box").not.toBeNull();
  expect(viewportSize, "browser viewport must be available for native drag").not.toBeNull();
  if (!sourceBeforeScroll || !viewportSize) return;
  await viewport.evaluate((element, sourceY) => {
    element.scrollTop += sourceY - 130;
  }, sourceBeforeScroll.y);
  await page.evaluate(() => new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  ));
  await handle.hover();

  const sourceBox = await handle.boundingBox();
  const targetBox = await target.boundingBox();
  expect(sourceBox, "drag handle must remain visible after canvas positioning").not.toBeNull();
  expect(targetBox, "drop target must be visible after canvas positioning").not.toBeNull();
  if (!sourceBox || !targetBox) return;

  const targetId = await target.getAttribute("data-node-id");
  expect(targetId, "drop target must expose its production node id").toBeTruthy();
  if (!targetId) return;
  const start = { x: sourceBox.x + sourceBox.width / 2, y: sourceBox.y + sourceBox.height / 2 };
  const end = {
    // Stay inside the visible canvas lane rather than fixed side chrome.
    x: targetBox.x + Math.min(12, targetBox.width / 2),
    y: Math.min(targetBox.y + targetBox.height - 56, viewportSize.height - 60),
  };

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x, start.y + 10, { steps: 4 });
  await expect(shell).toHaveAttribute("data-dnd-active-id", nodeId);
  await page.mouse.move(end.x, end.y, { steps: 24 });
  const safeY = viewportSize.height - Math.max(160, viewportSize.height * 0.2);
  let targetSurroundsSafeLane = false;
  for (let step = 0; step < 30; step += 1) {
    const live = await target.boundingBox();
    targetSurroundsSafeLane = Boolean(
      live && live.y + 40 < safeY && live.y + live.height - 40 > safeY,
    );
    if (targetSurroundsSafeLane) break;
    // Each native dragover event advances the production edge auto-scroll.
    await page.mouse.move(end.x + (step % 2 === 0 ? 1 : -1), end.y);
  }
  expect(targetSurroundsSafeLane, "native auto-scroll should expose Container B's safe inside lane").toBe(true);
  const liveTarget = await target.boundingBox();
  expect(liveTarget).not.toBeNull();
  if (!liveTarget) return;
  await page.mouse.move(liveTarget.x + Math.min(12, liveTarget.width / 2), safeY, { steps: 8 });
  await expect(shell).toHaveAttribute("data-dnd-over-id", targetId);
  await expect(shell).toHaveAttribute("data-dnd-intent", "inside");
  await expect(shell).toHaveAttribute("data-dnd-valid", "true");
  // Assertions take time while the production edge auto-scroll remains live.
  // Re-enter the target's current central padding lane immediately before
  // release so the committed pending drop matches the observed contract.
  const releaseBox = await target.boundingBox();
  expect(releaseBox).not.toBeNull();
  if (!releaseBox) return;
  await page.mouse.move(
    releaseBox.x + Math.min(12, releaseBox.width / 2),
    Math.max(60, releaseBox.y + 40),
    { steps: 2 },
  );
  await page.mouse.up();
  await expect(shell).toHaveAttribute("data-dnd-active-id", "");
}

export async function dragPaletteWidgetInside(
  page: Page,
  widgetType: string,
  target: Locator,
) {
  await page.evaluate(() => {
    (window as any).__builderLastDropCommit = null;
    window.addEventListener("builder:drop-commit", (event) => {
      (window as any).__builderLastDropCommit = (event as CustomEvent).detail;
    }, { once: true });
  });
  const source = page.getByTestId(`palette-widget-${widgetType}`);
  const shell = page.getByTestId("builder-shell");
  await expect(source).toBeVisible();
  await expect(target).toBeVisible();
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();
  expect(sourceBox).not.toBeNull();
  expect(targetBox).not.toBeNull();
  if (!sourceBox || !targetBox) return;
  const targetId = await target.getAttribute("data-node-id");
  expect(targetId).toBeTruthy();
  if (!targetId) return;

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(sourceBox.x + sourceBox.width / 2 + 10, sourceBox.y + sourceBox.height / 2, { steps: 4 });
  await expect(shell).toHaveAttribute("data-dnd-active-id", new RegExp(`^new:${widgetType}:`));
  const viewportSize = page.viewportSize();
  expect(viewportSize).not.toBeNull();
  if (!viewportSize) return;
  const targetLaneX = (box: { x: number; width: number }) =>
    box.x < viewportSize.width / 3
      ? Math.max(box.x + 40, Math.min(viewportSize.width / 2, box.x + box.width - 40))
      : box.x + Math.min(12, box.width / 2);
  const visibleCenter = targetBox.y + targetBox.height / 2;
  const edgeY = Math.min(targetBox.y + targetBox.height - 56, viewportSize.height - 60);
  await page.mouse.move(targetLaneX(targetBox),
    visibleCenter < viewportSize.height - 100 ? visibleCenter : edgeY, { steps: 24 });
  if (visibleCenter >= viewportSize.height - 100) {
    const safeY = viewportSize.height - Math.max(160, viewportSize.height * 0.2);
    let exposed = false;
    for (let step = 0; step < 40; step += 1) {
      const live = await target.boundingBox();
      exposed = Boolean(live && live.y + 40 < safeY && live.y + live.height - 40 > safeY);
      if (exposed) break;
      await page.mouse.move(targetLaneX(targetBox) + (step % 2 ? 1 : -1), edgeY);
    }
    expect(exposed, "native auto-scroll should expose the palette target lane").toBe(true);
    const live = await target.boundingBox();
    expect(live).not.toBeNull();
    if (!live) return;
    await page.mouse.move(targetLaneX(live), safeY, { steps: 8 });
  }
  await expect(shell).toHaveAttribute("data-dnd-over-id", targetId);
  await expect(shell).toHaveAttribute("data-dnd-intent", "inside");
  await expect(shell).toHaveAttribute("data-dnd-valid", "true");
  const releaseBox = await target.boundingBox();
  expect(releaseBox).not.toBeNull();
  if (!releaseBox) return;
  await page.mouse.move(targetLaneX(releaseBox), Math.max(60, releaseBox.y + 40), { steps: 2 });
  await page.mouse.up();
  await expect(shell).toHaveAttribute("data-dnd-active-id", "");
  const committed = await page.evaluate(() => (window as any).__builderLastDropCommit);
  expect(committed, "native palette drop must reach the production commit handler").toBeTruthy();
  expect(committed.targetParentId).toBe(targetId);
  expect(committed.intent).toBe("inside");
}

export async function dragSelectedNodeRelativeToSibling(
  page: Page,
  nodeId: string,
  sibling: Locator,
  intent: "before" | "after",
) {
  const handle = page.getByTestId(
    "builder-node-drag-handle",
  );
  const shell = page.getByTestId("builder-shell");

  await expect(handle).toHaveAttribute(
    "data-drag-node-id",
    nodeId,
  );

  await expect(sibling).toBeVisible();
  await handle.hover();

  const sourceBox = await handle.boundingBox();

  expect(
    sourceBox,
    "drag handle must have a browser bounding box",
  ).not.toBeNull();

  if (!sourceBox) {
    return;
  }

  const targetId = await sibling.getAttribute(
    "data-node-id",
  );

  expect(
    targetId,
    "sibling target must expose its production node id",
  ).toBeTruthy();

  if (!targetId) {
    return;
  }

  const startPoint = {
    x: sourceBox.x + sourceBox.width / 2,
    y: sourceBox.y + sourceBox.height / 2,
  };

  await page.mouse.move(
    startPoint.x,
    startPoint.y,
  );

  await page.mouse.down();

  await page.mouse.move(
    startPoint.x,
    startPoint.y + 10,
    { steps: 4 },
  );

  await expect(shell).toHaveAttribute(
    "data-dnd-active-id",
    nodeId,
  );

  /*
   * Probe several live points near the requested sibling edge.
   *
   * Fixed 3px offsets become unreliable when the canvas is scaled.
   * The production resolver remains the source of truth: the helper
   * accepts a point only after Builder reports the requested target,
   * intent and validity.
   */
  const edgeFractions =
    intent === "before"
      ? [0.02, 0.05, 0.08, 0.12, 0.18, 0.24, 0.3]
      : [0.98, 0.95, 0.92, 0.88, 0.82, 0.76, 0.7];

  let resolvedPoint:
    | {
        x: number;
        y: number;
      }
    | null = null;

  for (const fraction of edgeFractions) {
    const liveTargetBox = await sibling.boundingBox();

    expect(
      liveTargetBox,
      "sibling target must remain visible during drag",
    ).not.toBeNull();

    if (!liveTargetBox) {
      break;
    }

    const candidate = {
      x:
        liveTargetBox.x +
        Math.min(
          Math.max(6, liveTargetBox.width * 0.08),
          liveTargetBox.width / 2,
        ),
      y:
        liveTargetBox.y +
        liveTargetBox.height * fraction,
    };

    await page.mouse.move(
      candidate.x,
      candidate.y,
      { steps: 6 },
    );

    const observation = await shell.evaluate(
      (element) => ({
        overId:
          element.getAttribute("data-dnd-over-id") ??
          "",
        intent:
          element.getAttribute("data-dnd-intent") ??
          "",
        valid:
          element.getAttribute("data-dnd-valid") ===
          "true",
      }),
    );

    if (
      observation.overId === targetId &&
      observation.intent === intent &&
      observation.valid
    ) {
      resolvedPoint = candidate;
      break;
    }
  }

  expect(
    resolvedPoint,
    `production DnD resolver must expose ${intent} ` +
      `for sibling ${targetId}`,
  ).not.toBeNull();

  if (!resolvedPoint) {
    await page.mouse.up();
    return;
  }

  /*
   * Re-read the live target and move to the equivalent verified
   * fraction immediately before release. This protects against
   * geometry changes caused by drag chrome or canvas transforms.
   */
  const releaseBox = await sibling.boundingBox();

  expect(
    releaseBox,
    "sibling target must remain visible before release",
  ).not.toBeNull();

  if (!releaseBox) {
    await page.mouse.up();
    return;
  }

  const resolvedFraction =
    (resolvedPoint.y - releaseBox.y) /
    Math.max(releaseBox.height, 1);

  const releasePoint = {
    x:
      releaseBox.x +
      Math.min(
        Math.max(6, releaseBox.width * 0.08),
        releaseBox.width / 2,
      ),
    y:
      releaseBox.y +
      releaseBox.height *
        Math.max(0.01, Math.min(0.99, resolvedFraction)),
  };

  await page.mouse.move(
    releasePoint.x,
    releasePoint.y,
    { steps: 3 },
  );

  await expect(shell).toHaveAttribute(
    "data-dnd-over-id",
    targetId,
  );

  await expect(shell).toHaveAttribute(
    "data-dnd-intent",
    intent,
  );

  await expect(shell).toHaveAttribute(
    "data-dnd-valid",
    "true",
  );

  await page.mouse.up();

  await expect(shell).toHaveAttribute(
    "data-dnd-active-id",
    "",
  );
}

export async function dragPaletteWidgetRelativeToSibling(
  page: Page,
  widgetType: string,
  sibling: Locator,
  intent: "before" | "after",
) {
  await page.evaluate(() => {
    (window as any).__builderLastDropCommit = null;
    window.addEventListener("builder:drop-commit", (event) => {
      (window as any).__builderLastDropCommit = (event as CustomEvent).detail;
    }, { once: true });
  });
  const source = page.getByTestId(`palette-widget-${widgetType}`);
  const shell = page.getByTestId("builder-shell");
  const sourceBox = await source.boundingBox();
  const siblingBox = await sibling.boundingBox();
  expect(sourceBox).not.toBeNull();
  expect(siblingBox).not.toBeNull();
  if (!sourceBox || !siblingBox) return;
  const siblingId = await sibling.getAttribute("data-node-id");
  expect(siblingId).toBeTruthy();
  if (!siblingId) return;
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(sourceBox.x + sourceBox.width / 2 + 10, sourceBox.y + sourceBox.height / 2, { steps: 4 });
  await expect(shell).toHaveAttribute("data-dnd-active-id", new RegExp(`^new:${widgetType}:`));
  const live = await sibling.boundingBox();
  expect(live).not.toBeNull();
  if (!live) return;
  await page.mouse.move(
    live.x + Math.min(100, live.width / 2),
    intent === "before" ? live.y + 3 : live.y + live.height - 3,
    { steps: 18 },
  );
  await expect(shell).toHaveAttribute("data-dnd-over-id", siblingId);
  await expect(shell).toHaveAttribute("data-dnd-intent", intent);
  await page.mouse.up();
  const committed = await page.evaluate(() => (window as any).__builderLastDropCommit);
  expect(committed).toBeTruthy();
  expect(committed.intent).toBe(intent);
}

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

  expect(
    sourceBox,
    "palette source must have a browser bounding box",
  ).not.toBeNull();

  if (!sourceBox) {
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
   * Locate a real visible point whose topmost Builder node is the
   * requested target. This avoids accidentally hitting a containing
   * Section after vertical or horizontal canvas scrolling.
   */
  const resolveTargetPoint = async () =>
    page.evaluate((requestedTargetId) => {
      const targetElement = document.querySelector(
        `.builder-canvas-sandbox [data-node-id="${CSS.escape(
          requestedTargetId,
        )}"]`,
      ) as HTMLElement | null;

      const viewportElement = document.querySelector(
        "[data-builder-canvas-scroll='true']",
      ) as HTMLElement | null;

      if (!targetElement || !viewportElement) {
        return null;
      }

      const targetRect = targetElement.getBoundingClientRect();
      const viewportRect =
        viewportElement.getBoundingClientRect();

      const visibleLeft = Math.max(
        targetRect.left,
        viewportRect.left,
      );
      const visibleRight = Math.min(
        targetRect.right,
        viewportRect.right,
      );
      const visibleTop = Math.max(
        targetRect.top,
        viewportRect.top,
      );
      const visibleBottom = Math.min(
        targetRect.bottom,
        viewportRect.bottom,
      );

      if (
        visibleRight <= visibleLeft ||
        visibleBottom <= visibleTop
      ) {
        return null;
      }

      const insetValues = [
        6,
        10,
        14,
        18,
        24,
        32,
        40,
      ];

      const candidates: Array<{
        x: number;
        y: number;
      }> = [];

      for (const inset of insetValues) {
        candidates.push(
          {
            x: visibleLeft + inset,
            y: visibleTop + inset,
          },
          {
            x: visibleRight - inset,
            y: visibleTop + inset,
          },
          {
            x: visibleLeft + inset,
            y: visibleBottom - inset,
          },
          {
            x: visibleRight - inset,
            y: visibleBottom - inset,
          },
          {
            x: visibleLeft + inset,
            y: (visibleTop + visibleBottom) / 2,
          },
          {
            x: visibleRight - inset,
            y: (visibleTop + visibleBottom) / 2,
          },
          {
            x: (visibleLeft + visibleRight) / 2,
            y: visibleTop + inset,
          },
          {
            x: (visibleLeft + visibleRight) / 2,
            y: visibleBottom - inset,
          },
        );
      }

      candidates.push({
        x: (visibleLeft + visibleRight) / 2,
        y: (visibleTop + visibleBottom) / 2,
      });

      for (const candidate of candidates) {
        if (
          candidate.x <= viewportRect.left ||
          candidate.x >= viewportRect.right ||
          candidate.y <= viewportRect.top ||
          candidate.y >= viewportRect.bottom
        ) {
          continue;
        }

        const elements = document.elementsFromPoint(
          candidate.x,
          candidate.y,
        );

        const topBuilderNode = elements.find(
          (element) =>
            element.hasAttribute("data-node-id") &&
            element.closest(".builder-canvas-sandbox"),
        );

        if (
          topBuilderNode?.getAttribute("data-node-id") ===
          requestedTargetId
        ) {
          return candidate;
        }
      }

      return null;
    }, targetId);

  let targetPoint = await resolveTargetPoint();

  expect(
    targetPoint,
    `a visible direct hit lane must exist for ${targetId}`,
  ).not.toBeNull();

  if (!targetPoint) {
    await page.mouse.up();
    return;
  }

  await page.mouse.move(
    targetPoint.x,
    targetPoint.y,
    { steps: 32 },
  );

  /*
   * Geometry may change while moving the drag ghost. Resolve the lane
   * again immediately before asserting and releasing.
   */
  targetPoint = await resolveTargetPoint();

  expect(targetPoint).not.toBeNull();

  if (!targetPoint) {
    await page.mouse.up();
    return;
  }

  await page.mouse.move(
    targetPoint.x,
    targetPoint.y,
    { steps: 6 },
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
   * Revalidate the exact hit lane immediately before mouse release.
   */
  const releasePoint = await resolveTargetPoint();

  expect(releasePoint).not.toBeNull();

  if (!releasePoint) {
    await page.mouse.up();
    return;
  }

  await page.mouse.move(
    releasePoint.x,
    releasePoint.y,
    { steps: 3 },
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
