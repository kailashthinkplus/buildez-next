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
  const viewport = page.locator(
    "[data-builder-canvas-scroll='true']",
  );

  await expect(handle).toHaveAttribute(
    "data-drag-node-id",
    nodeId,
  );
  await expect(target).toBeVisible();

  const viewportSize = page.viewportSize();
  const sourceBeforeScroll = await handle.boundingBox();

  expect(
    sourceBeforeScroll,
    "drag handle must have a browser bounding box",
  ).not.toBeNull();
  expect(
    viewportSize,
    "browser viewport must be available for native drag",
  ).not.toBeNull();

  if (!sourceBeforeScroll || !viewportSize) return;

  /*
   * Position the source handle in a stable visible lane before beginning
   * native drag. The target may subsequently require native autoscroll.
   */
  await viewport.evaluate((element, sourceY) => {
    element.scrollTop += sourceY - 130;
  }, sourceBeforeScroll.y);

  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => resolve()),
        );
      }),
  );

  await handle.hover();

  const sourceBox = await handle.boundingBox();

  expect(
    sourceBox,
    "drag handle must remain visible after canvas positioning",
  ).not.toBeNull();

  if (!sourceBox) return;

  const targetId = await target.getAttribute("data-node-id");

  expect(
    targetId,
    "drop target must expose its production node id",
  ).toBeTruthy();

  if (!targetId) return;

  /*
   * Observe the authoritative production commit. The visual hit node may
   * be a child widget, while the computed destination parent is still the
   * requested Container.
   */
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

  const start = {
    x: sourceBox.x + sourceBox.width / 2,
    y: sourceBox.y + sourceBox.height / 2,
  };

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(
    start.x,
    start.y + 10,
    { steps: 4 },
  );

  await expect(shell).toHaveAttribute(
    "data-dnd-active-id",
    nodeId,
  );

  const readState = async () =>
    shell.evaluate((element) => ({
      overId: element.getAttribute("data-dnd-over-id"),
      intent: element.getAttribute("data-dnd-intent"),
      valid: element.getAttribute("data-dnd-valid"),
    }));

  let stablePoint:
    | { x: number; y: number }
    | null = null;

  /*
   * Recompute target geometry every round. Native drag movement may
   * autoscroll the canvas, so stale bounding boxes are not trustworthy.
   */
  for (
    let round = 0;
    round < 12 && !stablePoint;
    round += 1
  ) {
    const box = await target.boundingBox();

    if (!box) {
      await page.waitForTimeout(24);
      continue;
    }

    const visibleLeft = Math.max(1, box.x + 4);
    const visibleRight = Math.min(
      viewportSize.width - 1,
      box.x + box.width - 4,
    );
    const visibleTop = Math.max(58, box.y + 4);
    const visibleBottom = Math.min(
      viewportSize.height - 50,
      box.y + box.height - 4,
    );

    if (
      visibleRight > visibleLeft &&
      visibleBottom > visibleTop
    ) {
      /*
       * Nested containers may expose only a narrow padding lane around
       * their child content. Fractional points can land entirely on the
       * child widget, so probe absolute edge insets and corners first.
       */
      const width = visibleRight - visibleLeft;
      const height = visibleBottom - visibleTop;

      const clampX = (value: number) =>
        Math.max(
          visibleLeft + 1,
          Math.min(visibleRight - 1, value),
        );

      const clampY = (value: number) =>
        Math.max(
          visibleTop + 1,
          Math.min(visibleBottom - 1, value),
        );

      const edgeInsets = [2, 5, 9, 14, 20, 28];

      const points: Array<{ x: number; y: number }> = [];

      for (const inset of edgeInsets) {
        const leftX = clampX(visibleLeft + inset);
        const rightX = clampX(visibleRight - inset);
        const topY = clampY(visibleTop + inset);
        const bottomY = clampY(visibleBottom - inset);
        const centreX = clampX(visibleLeft + width / 2);
        const centreY = clampY(visibleTop + height / 2);

        points.push(
          { x: leftX, y: topY },
          { x: rightX, y: topY },
          { x: leftX, y: bottomY },
          { x: rightX, y: bottomY },
          { x: leftX, y: centreY },
          { x: rightX, y: centreY },
          { x: centreX, y: topY },
          { x: centreX, y: bottomY },
        );
      }

      points.push(
        {
          x: clampX(visibleLeft + width * 0.25),
          y: clampY(visibleTop + height * 0.25),
        },
        {
          x: clampX(visibleLeft + width * 0.75),
          y: clampY(visibleTop + height * 0.25),
        },
        {
          x: clampX(visibleLeft + width * 0.25),
          y: clampY(visibleTop + height * 0.75),
        },
        {
          x: clampX(visibleLeft + width * 0.75),
          y: clampY(visibleTop + height * 0.75),
        },
        {
          x: clampX(visibleLeft + width / 2),
          y: clampY(visibleTop + height / 2),
        },
      );

      const uniquePoints = points.filter(
        (point, index, collection) =>
          collection.findIndex(
            (candidate) =>
              Math.round(candidate.x) === Math.round(point.x) &&
              Math.round(candidate.y) === Math.round(point.y),
          ) === index,
      );

      for (const point of uniquePoints) {
        await page.mouse.move(
          point.x,
          point.y,
          { steps: round === 0 ? 3 : 1 },
        );
        await page.waitForTimeout(20);

        const state = await readState();

        if (
          state.overId !== targetId ||
          state.intent !== "inside" ||
          state.valid !== "true"
        ) {
          continue;
        }

        await page.mouse.move(
          point.x,
          point.y,
          { steps: 1 },
        );
        await page.waitForTimeout(24);

        const confirmed = await readState();

        if (
          confirmed.overId === targetId &&
          confirmed.intent === "inside" &&
          confirmed.valid === "true"
        ) {
          stablePoint = point;
          break;
        }
      }
    }

    if (stablePoint) break;

    /*
     * Keep native autoscroll active when the nested target has not yet
     * entered a usable viewport lane.
     */
    const targetCentreY = box.y + box.height / 2;
    const scrollY =
      targetCentreY > viewportSize.height / 2
        ? viewportSize.height - 62
        : 66;

    const scrollX = Math.max(
      1,
      Math.min(
        viewportSize.width - 1,
        box.x + Math.min(20, box.width / 2),
      ),
    );

    await page.mouse.move(
      scrollX + (round % 2 === 0 ? 1 : -1),
      scrollY,
      { steps: 2 },
    );
    await page.waitForTimeout(32);
  }

  expect(
    stablePoint,
    `production DnD must stabilize inside ${targetId}`,
  ).not.toBeNull();

  if (!stablePoint) {
    await page.mouse.up();
    return;
  }

  /*
   * Native autoscroll can shift child content after the first stable
   * point is found. Reacquire a direct lane belonging to the requested
   * target immediately before release.
   */
  const resolveDirectTargetPoint = async () =>
    target.evaluate((element, requestedTargetId) => {
      const rect = element.getBoundingClientRect();

      const left = Math.max(1, rect.left + 2);
      const right = Math.min(
        window.innerWidth - 1,
        rect.right - 2,
      );
      const top = Math.max(58, rect.top + 2);
      const bottom = Math.min(
        window.innerHeight - 50,
        rect.bottom - 2,
      );

      if (right <= left || bottom <= top) {
        return null;
      }

      const insets = [3, 6, 10, 16, 24, 32];
      const points: Array<{ x: number; y: number }> = [];

      for (const inset of insets) {
        const x1 = Math.min(right - 1, left + inset);
        const x2 = Math.max(left + 1, right - inset);
        const y1 = Math.min(bottom - 1, top + inset);
        const y2 = Math.max(top + 1, bottom - inset);
        const cx = (left + right) / 2;
        const cy = (top + bottom) / 2;

        points.push(
          { x: x1, y: y1 },
          { x: x2, y: y1 },
          { x: x1, y: y2 },
          { x: x2, y: y2 },
          { x: x1, y: cy },
          { x: x2, y: cy },
          { x: cx, y: y1 },
          { x: cx, y: y2 },
        );
      }

      points.push({
        x: (left + right) / 2,
        y: (top + bottom) / 2,
      });

      for (const point of points) {
        const stack = document.elementsFromPoint(
          point.x,
          point.y,
        );

        const topBuilderNode = stack.find(
          (candidate) =>
            candidate instanceof HTMLElement &&
            candidate.hasAttribute("data-node-id") &&
            candidate.closest(".builder-canvas-sandbox"),
        );

        if (
          topBuilderNode?.getAttribute("data-node-id") ===
          requestedTargetId
        ) {
          return point;
        }
      }

      return null;
    }, targetId);

  /*
   * A non-empty Container may have no exposed direct-hit lane because
   * its children cover the rendered surface. In that case a child
   * before/after target is valid when the child's parent is the requested
   * Container. The production commit remains the final authority.
   */
  let releasePoint:
    | { x: number; y: number }
    | null = stablePoint;

  let releaseStable = false;

  const stateTargetsRequestedParent = async (
    state: {
      overId: string | null;
      intent: string | null;
      valid: string | null;
    },
  ) => {
    if (
      state.valid !== "true" ||
      !state.overId
    ) {
      return false;
    }

    if (
      state.overId === targetId &&
      state.intent === "inside"
    ) {
      return true;
    }

    return page.evaluate(
      ({ overId, requestedParentId }) => {
        const escaped =
          typeof CSS !== "undefined" &&
          typeof CSS.escape === "function"
            ? CSS.escape(overId)
            : overId.replace(
                /["\\]/g,
                "\\$&",
              );

        const element =
          document.querySelector<HTMLElement>(
            `.builder-canvas-sandbox [data-node-id="${escaped}"]`,
          );

        return (
          element?.getAttribute(
            "data-node-parent-id",
          ) === requestedParentId
        );
      },
      {
        overId: state.overId,
        requestedParentId: targetId,
      },
    );
  };

  /*
   * First try the point already stabilized by the earlier scan. If
   * native autoscroll moved the layout, rescan the live target rectangle.
   */
  for (
    let attempt = 0;
    attempt < 20 && !releaseStable;
    attempt += 1
  ) {
    const liveBox =
      await target.boundingBox();

    const candidates: Array<{
      x: number;
      y: number;
    }> = [];

    if (releasePoint) {
      candidates.push(releasePoint);
    }

    if (liveBox) {
      const left = Math.max(
        1,
        liveBox.x + 3,
      );
      const right = Math.min(
        viewportSize.width - 1,
        liveBox.x + liveBox.width - 3,
      );
      const top = Math.max(
        58,
        liveBox.y + 3,
      );
      const bottom = Math.min(
        viewportSize.height - 50,
        liveBox.y + liveBox.height - 3,
      );

      if (
        right > left &&
        bottom > top
      ) {
        const width = right - left;
        const height = bottom - top;

        candidates.push(
          {
            x: left + width * 0.05,
            y: top + height * 0.5,
          },
          {
            x: right - width * 0.05,
            y: top + height * 0.5,
          },
          {
            x: left + width * 0.5,
            y: top + height * 0.15,
          },
          {
            x: left + width * 0.5,
            y: bottom - height * 0.15,
          },
          {
            x: left + width * 0.5,
            y: top + height * 0.5,
          },
        );
      }
    }

    for (const candidate of candidates) {
      await page.mouse.move(
        candidate.x,
        candidate.y,
        {
          steps:
            attempt === 0 ? 2 : 1,
        },
      );

      await page.waitForTimeout(20);

      const firstState =
        await readState();

      if (
        !(await stateTargetsRequestedParent(
          firstState,
        ))
      ) {
        continue;
      }

      await page.mouse.move(
        candidate.x,
        candidate.y,
        { steps: 1 },
      );

      await page.waitForTimeout(20);

      const confirmedState =
        await readState();

      if (
        await stateTargetsRequestedParent(
          confirmedState,
        )
      ) {
        releasePoint = candidate;
        releaseStable = true;
        break;
      }
    }

    if (!releaseStable) {
      await page.waitForTimeout(24);
    }
  }

  expect(
    releaseStable,
    `production DnD must stabilize on a destination owned by ${targetId}`,
  ).toBe(true);

  if (!releasePoint) {
    await page.mouse.up();
    return;
  }

  /*
   * The point was already validated twice inside the stabilization loop.
   * Release immediately at that exact point. Additional movement, waits,
   * or DOM reads can allow native autoscroll to change the pending/current
   * target pair before BuilderShell performs its final commit validation.
   */
  await page.mouse.move(
    releasePoint.x,
    releasePoint.y,
    { steps: 1 },
  );

  const immediateState =
    await readState();

  expect(
    await stateTargetsRequestedParent(
      immediateState,
    ),
    `release target must resolve to parent ${targetId}`,
  ).toBe(true);

  await page.mouse.up();

  await expect(shell).toHaveAttribute(
    "data-dnd-active-id",
    "",
  );

  /*
   * Verify the observable production result first. The node-parent DOM
   * relationship is the user-facing contract and may already reflect a
   * successful reparent even if test instrumentation missed the custom
   * drop-commit event.
   */
  const movedToRequestedParent = await expect
    .poll(
      async () =>
        page
          .locator(
            `.builder-canvas-sandbox [data-node-id="${nodeId}"]`,
          )
          .first()
          .getAttribute("data-node-parent-id"),
      {
        message:
          `selected node must move under ${targetId}`,
        timeout: 2_000,
      },
    )
    .toBe(targetId)
    .then(
      () => true,
      () => false,
    );

  if (movedToRequestedParent) {
    return;
  }

  /*
   * When the DOM has not reflected the move, require the authoritative
   * production commit event so a genuine failed drag is still rejected.
   */
  await expect
    .poll(
      async () =>
        page.evaluate(
          () =>
            (window as any)
              .__builderLastDropCommit ??
            null,
        ),
      {
        message:
          "selected-node drag must reach the production drop commit handler",
        timeout: 5_000,
      },
    )
    .not.toBeNull();

  const commit =
    await page.evaluate(
      () =>
        (window as any)
          .__builderLastDropCommit ??
        null,
    );

  expect(commit).toBeTruthy();
  expect(commit.targetParentId).toBe(
    targetId,
  );
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
  const edgeY = Math.min(
    targetBox.y + targetBox.height - 56,
    viewportSize.height - 60
  );

  let verifiedInsidePoint = {
    x: targetLaneX(targetBox),
    y:
      visibleCenter < viewportSize.height - 100
        ? visibleCenter
        : edgeY,
  };

  await page.mouse.move(
    verifiedInsidePoint.x,
    verifiedInsidePoint.y,
    { steps: 24 }
  );
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
    verifiedInsidePoint = {
      x: targetLaneX(live),
      y: safeY,
    };

    await page.mouse.move(
      verifiedInsidePoint.x,
      verifiedInsidePoint.y,
      { steps: 8 }
    );
  }
  /*
   * Use the production BuilderShell DnD state as the authority.
   * Browser hit-stack inspection can disagree with BuilderShell because
   * production deliberately resolves layout ancestors and nested wrappers.
   */
  const readDndState = async () =>
    shell.evaluate((element) => ({
      overId:
        element.getAttribute("data-dnd-over-id"),
      intent:
        element.getAttribute("data-dnd-intent"),
      valid:
        element.getAttribute("data-dnd-valid"),
    }));

  let stablePoint:
    | { x: number; y: number }
    | null = null;

  /*
   * Recalculate the target rectangle on every round because moving a
   * native drag can activate canvas autoscroll and shift the layout.
   */
  for (
    let round = 0;
    round < 5 && !stablePoint;
    round += 1
  ) {
    const liveBox = await target.boundingBox();

    if (!liveBox) {
      await page.waitForTimeout(20);
      continue;
    }

    const left = Math.max(
      1,
      liveBox.x + 4,
    );
    const right = Math.min(
      viewportSize.width - 1,
      liveBox.x + liveBox.width - 4,
    );
    const top = Math.max(
      1,
      liveBox.y + 4,
    );
    const bottom = Math.min(
      viewportSize.height - 1,
      liveBox.y + liveBox.height - 4,
    );

    if (right <= left || bottom <= top) {
      await page.waitForTimeout(20);
      continue;
    }

    /*
     * Test centre and padding-like lanes first, followed by a denser grid.
     */
    const xFractions = [
      0.08,
      0.15,
      0.5,
      0.85,
      0.92,
      0.04,
      0.25,
      0.75,
      0.96,
    ];

    const yFractions = [
      0.5,
      0.25,
      0.75,
      0.15,
      0.85,
      0.08,
      0.92,
    ];

    for (const yFraction of yFractions) {
      if (stablePoint) break;

      for (const xFraction of xFractions) {
        const point = {
          x: left + (right - left) * xFraction,
          y: top + (bottom - top) * yFraction,
        };

        await page.mouse.move(
          point.x,
          point.y,
          { steps: round === 0 ? 3 : 1 },
        );

        await page.waitForTimeout(18);

        const state = await readDndState();

        if (
          state.overId !== targetId ||
          state.intent !== "inside" ||
          state.valid !== "true"
        ) {
          continue;
        }

        /*
         * Verify the same point twice so we do not release during a
         * transient state caused by canvas movement.
         */
        await page.mouse.move(
          point.x,
          point.y,
          { steps: 1 },
        );

        await page.waitForTimeout(18);

        const confirmedState =
          await readDndState();

        if (
          confirmedState.overId === targetId &&
          confirmedState.intent === "inside" &&
          confirmedState.valid === "true"
        ) {
          stablePoint = point;
          break;
        }
      }
    }
  }

  expect(
    stablePoint,
    `production DnD must stabilize inside ${targetId}`,
  ).not.toBeNull();

  if (!stablePoint) {
    await page.mouse.up();
    return;
  }

  await page.mouse.move(
    stablePoint.x,
    stablePoint.y,
    { steps: 1 },
  );

  await page.waitForTimeout(12);

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

  await expect(source).toBeVisible();
  await expect(sibling).toBeVisible();

  const sourceBox = await source.boundingBox();
  const siblingId = await sibling.getAttribute("data-node-id");

  expect(sourceBox).not.toBeNull();
  expect(siblingId).toBeTruthy();

  if (!sourceBox || !siblingId) return;

  await page.mouse.move(
    sourceBox.x + sourceBox.width / 2,
    sourceBox.y + sourceBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    sourceBox.x + sourceBox.width / 2 + 10,
    sourceBox.y + sourceBox.height / 2,
    { steps: 4 },
  );

  await expect(shell).toHaveAttribute(
    "data-dnd-active-id",
    new RegExp(`^new:${widgetType}:`),
  );

  const readState = async () =>
    shell.evaluate((element) => ({
      overId: element.getAttribute("data-dnd-over-id"),
      intent: element.getAttribute("data-dnd-intent"),
      valid: element.getAttribute("data-dnd-valid"),
    }));

  let stablePoint:
    | { x: number; y: number }
    | null = null;

  /*
   * Probe several horizontal positions along the requested sibling edge.
   * The bounding box is recalculated because native drag movement can
   * shift canvas geometry.
   */
  for (
    let round = 0;
    round < 8 && !stablePoint;
    round += 1
  ) {
    const box = await sibling.boundingBox();

    if (!box) {
      await page.waitForTimeout(20);
      continue;
    }

    const edgeInsetCandidates = [
      2,
      3,
      4,
      6,
      8,
      10,
      12,
    ];

    const xFractions = [
      0.5,
      0.25,
      0.75,
      0.1,
      0.9,
    ];

    for (const edgeInset of edgeInsetCandidates) {
      if (stablePoint) break;

      const y =
        intent === "before"
          ? box.y + Math.min(edgeInset, box.height / 3)
          : box.y +
            box.height -
            Math.min(edgeInset, box.height / 3);

      for (const xFraction of xFractions) {
        const point = {
          x: box.x + box.width * xFraction,
          y,
        };

        await page.mouse.move(
          point.x,
          point.y,
          { steps: round === 0 ? 3 : 1 },
        );
        await page.waitForTimeout(16);

        const state = await readState();

        if (
          state.overId !== siblingId ||
          state.intent !== intent ||
          state.valid !== "true"
        ) {
          continue;
        }

        await page.mouse.move(
          point.x,
          point.y,
          { steps: 1 },
        );
        await page.waitForTimeout(16);

        const confirmed = await readState();

        if (
          confirmed.overId === siblingId &&
          confirmed.intent === intent &&
          confirmed.valid === "true"
        ) {
          stablePoint = point;
          break;
        }
      }
    }
  }

  expect(
    stablePoint,
    `production DnD must stabilize ${intent} ${siblingId}`,
  ).not.toBeNull();

  if (!stablePoint) {
    await page.mouse.up();
    return;
  }

  await page.mouse.move(
    stablePoint.x,
    stablePoint.y,
    { steps: 1 },
  );
  await page.waitForTimeout(12);

  await expect(shell).toHaveAttribute(
    "data-dnd-over-id",
    siblingId,
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

  const committed = await page.evaluate(
    () => (window as any).__builderLastDropCommit,
  );

  expect(
    committed,
    "relative palette drop must reach the production commit handler",
  ).toBeTruthy();

  expect(committed.referenceNodeId).toBe(siblingId);
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

  /*
   * Moving through a scrollable canvas can leave edge auto-scroll active.
   * Re-resolve the requested target until the pointer and rendered target
   * settle at the same direct-hit point.
   */
  let stabilized = false;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    targetPoint = await resolveTargetPoint();

    if (!targetPoint) {
      await page.waitForTimeout(16);
      continue;
    }

    await page.mouse.move(
      targetPoint.x,
      targetPoint.y,
      { steps: attempt === 0 ? 6 : 2 },
    );

    await page.waitForTimeout(32);

    const state = await shell.evaluate((element) => ({
      overId: element.getAttribute("data-dnd-over-id"),
      intent: element.getAttribute("data-dnd-intent"),
      valid: element.getAttribute("data-dnd-valid"),
    }));

    if (
      state.overId === targetId &&
      state.intent === "inside" &&
      state.valid === "true"
    ) {
      stabilized = true;
      break;
    }
  }

  expect(
    stabilized,
    `drag target ${targetId} must stabilize as a valid inside target`,
  ).toBe(true);

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
