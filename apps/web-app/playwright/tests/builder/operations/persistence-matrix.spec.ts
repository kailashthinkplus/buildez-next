import {
  expect,
  request,
  test,
  type Page,
} from "@playwright/test";
import { authFile } from "../../../../playwright.config";
import {
  builderNode,
  expectNodeParent,
  expectSelectedNode,
  saveBuilderNow,
} from "../../../helpers/builderAssertions";
import {
  dragSelectedNodeByHandle,
  dragSelectedNodeRelativeToSibling,
} from "../../../helpers/builderDrag";
import {
  FIXTURE_IDS,
  createDisposableBuilderPage,
  deleteDisposableBuilderPage,
  openDisposableBuilder,
  readDisposableBlueprint,
} from "../../../helpers/builderFixture";

let disposablePageId: string | null = null;

async function directChildIds(
  page: Page,
  parentId: string,
): Promise<string[]> {
  return page
    .locator(
      `.builder-canvas-sandbox ` +
        `[data-node-parent-id='${parentId}']`,
    )
    .evaluateAll((elements) =>
      elements
        .map((element) =>
          element.getAttribute("data-node-id"),
        )
        .filter(
          (id): id is string =>
            typeof id === "string" &&
            id.length > 0,
        ),
    );
}

function blueprintOccurrences(
  blueprint: any,
  nodeId: string,
): number {
  return Object.values(
    blueprint.nodes ?? {},
  )
    .flatMap(
      (node: any) =>
        Array.isArray(node.children)
          ? node.children
          : [],
    )
    .filter((id) => id === nodeId)
    .length;
}

async function selectedNodeId(
  page: Page,
): Promise<string> {
  const id = await page
    .getByTestId("builder-selection-toolbar")
    .getAttribute("data-selected-node-id");

  expect(
    id,
    "operation must leave the affected node selected",
  ).toBeTruthy();

  if (!id) {
    throw new Error(
      "Builder selection toolbar did not expose a selected node id",
    );
  }

  return id;
}

test.afterEach(async () => {
  test.setTimeout(20_000);

  if (!disposablePageId) {
    return;
  }

  const cleanupRequest =
    await request.newContext({
      baseURL:
        process.env.PLAYWRIGHT_BASE_URL ??
        "http://127.0.0.1:3000",
      storageState: authFile,
    });

  try {
    await deleteDisposableBuilderPage(
      cleanupRequest,
      disposablePageId,
    );

    disposablePageId = null;
  } finally {
    await cleanupRequest.dispose();
  }
});

test(
  "@operations @persistence duplicate persists exactly once and survives reload",
  async ({ page }) => {
    test.setTimeout(45_000);

    const fixture =
      await createDisposableBuilderPage(
        page.request,
      );

    disposablePageId = fixture.id;

    await openDisposableBuilder(
      page,
      fixture,
    );

    await builderNode(
      page,
      FIXTURE_IDS.headingA,
    ).click();

    await expectSelectedNode(
      page,
      FIXTURE_IDS.headingA,
    );

    await page
      .getByTitle("Duplicate element")
      .click();

    const duplicateId =
      await selectedNodeId(page);

    expect(duplicateId).not.toBe(
      FIXTURE_IDS.headingA,
    );

    await expectNodeParent(
      page,
      duplicateId,
      FIXTURE_IDS.containerA,
    );

    await saveBuilderNow(
      page,
      fixture.id,
    );

    const persisted =
      await readDisposableBlueprint(
        page.request,
        fixture.id,
      );

    expect(
      persisted.nodes[duplicateId],
    ).toBeTruthy();

    expect(
      persisted.nodes[duplicateId].parentId,
    ).toBe(FIXTURE_IDS.containerA);

    expect(
      blueprintOccurrences(
        persisted,
        duplicateId,
      ),
    ).toBe(1);

    expect(
      persisted.nodes[
        FIXTURE_IDS.containerA
      ].children,
    ).toContain(duplicateId);

    await page.reload({
      waitUntil: "domcontentloaded",
      timeout: 15_000,
    });

    await expectNodeParent(
      page,
      duplicateId,
      FIXTURE_IDS.containerA,
    );

    await expect(
      builderNode(page, duplicateId),
    ).toHaveCount(1);
  },
);

test(
  "@operations @persistence delete removes node and survives reload",
  async ({ page }) => {
    test.setTimeout(45_000);

    const fixture =
      await createDisposableBuilderPage(
        page.request,
      );

    disposablePageId = fixture.id;

    await openDisposableBuilder(
      page,
      fixture,
    );

    await builderNode(
      page,
      FIXTURE_IDS.textA,
    ).click();

    await expectSelectedNode(
      page,
      FIXTURE_IDS.textA,
    );

    await page
      .getByTitle("Delete element")
      .click();

    await expect(
      builderNode(
        page,
        FIXTURE_IDS.textA,
      ),
    ).toHaveCount(0);

    await saveBuilderNow(
      page,
      fixture.id,
    );

    const persisted =
      await readDisposableBlueprint(
        page.request,
        fixture.id,
      );

    expect(
      persisted.nodes[FIXTURE_IDS.textA],
    ).toBeUndefined();

    expect(
      persisted.nodes[
        FIXTURE_IDS.containerA
      ].children,
    ).not.toContain(FIXTURE_IDS.textA);

    expect(
      blueprintOccurrences(
        persisted,
        FIXTURE_IDS.textA,
      ),
    ).toBe(0);

    await page.reload({
      waitUntil: "domcontentloaded",
      timeout: 15_000,
    });

    await expect(
      builderNode(
        page,
        FIXTURE_IDS.textA,
      ),
    ).toHaveCount(0);
  },
);

test(
  "@operations @persistence reorder preserves exact sibling order after reload",
  async ({ page }) => {
    test.setTimeout(45_000);

    const fixture =
      await createDisposableBuilderPage(
        page.request,
      );

    disposablePageId = fixture.id;

    await openDisposableBuilder(
      page,
      fixture,
    );

    await builderNode(
      page,
      FIXTURE_IDS.textA,
    ).click();

    await dragSelectedNodeRelativeToSibling(
      page,
      FIXTURE_IDS.textA,
      builderNode(
        page,
        FIXTURE_IDS.buttonA,
      ),
      "after",
    );

    const expectedOrder = [
      FIXTURE_IDS.headingA,
      FIXTURE_IDS.buttonA,
      FIXTURE_IDS.textA,
    ];

    await expect
      .poll(async () =>
        directChildIds(
          page,
          FIXTURE_IDS.containerA,
        ),
      )
      .toEqual(expectedOrder);

    await saveBuilderNow(
      page,
      fixture.id,
    );

    const persisted =
      await readDisposableBlueprint(
        page.request,
        fixture.id,
      );

    expect(
      persisted.nodes[
        FIXTURE_IDS.containerA
      ].children,
    ).toEqual(expectedOrder);

    expect(
      blueprintOccurrences(
        persisted,
        FIXTURE_IDS.textA,
      ),
    ).toBe(1);

    await page.reload({
      waitUntil: "domcontentloaded",
      timeout: 15_000,
    });

    await expect
      .poll(async () =>
        directChildIds(
          page,
          FIXTURE_IDS.containerA,
        ),
      )
      .toEqual(expectedOrder);
  },
);

test(
  "@operations @persistence cross-container move persists one parent and survives reload",
  async ({ page }) => {
    test.setTimeout(45_000);

    const fixture =
      await createDisposableBuilderPage(
        page.request,
      );

    disposablePageId = fixture.id;

    await openDisposableBuilder(
      page,
      fixture,
    );

    await builderNode(
      page,
      FIXTURE_IDS.buttonA,
    ).click();

    await expectSelectedNode(
      page,
      FIXTURE_IDS.buttonA,
    );

    await dragSelectedNodeByHandle(
      page,
      FIXTURE_IDS.buttonA,
      builderNode(
        page,
        FIXTURE_IDS.containerB,
      ),
    );

    await expectNodeParent(
      page,
      FIXTURE_IDS.buttonA,
      FIXTURE_IDS.containerB,
    );

    await expectSelectedNode(
      page,
      FIXTURE_IDS.buttonA,
    );

    await saveBuilderNow(
      page,
      fixture.id,
    );

    const persisted =
      await readDisposableBlueprint(
        page.request,
        fixture.id,
      );

    expect(
      persisted.nodes[
        FIXTURE_IDS.buttonA
      ].parentId,
    ).toBe(FIXTURE_IDS.containerB);

    expect(
      persisted.nodes[
        FIXTURE_IDS.containerA
      ].children,
    ).not.toContain(FIXTURE_IDS.buttonA);

    expect(
      persisted.nodes[
        FIXTURE_IDS.containerB
      ].children,
    ).toContain(FIXTURE_IDS.buttonA);

    expect(
      blueprintOccurrences(
        persisted,
        FIXTURE_IDS.buttonA,
      ),
    ).toBe(1);

    await page.reload({
      waitUntil: "domcontentloaded",
      timeout: 15_000,
    });

    await expectNodeParent(
      page,
      FIXTURE_IDS.buttonA,
      FIXTURE_IDS.containerB,
    );

    await expect(
      builderNode(
        page,
        FIXTURE_IDS.buttonA,
      ),
    ).toHaveCount(1);
  },
);

test(
  "@operations @persistence copy paste creates one independent node and survives reload",
  async ({ page }) => {
    test.setTimeout(45_000);

    const fixture =
      await createDisposableBuilderPage(
        page.request,
      );

    disposablePageId = fixture.id;

    await openDisposableBuilder(
      page,
      fixture,
    );

    await builderNode(
      page,
      FIXTURE_IDS.headingA,
    ).click();

    await expectSelectedNode(
      page,
      FIXTURE_IDS.headingA,
    );

    /*
     * Text-capable nodes enter inline editing when clicked.
     * Builder operation shortcuts are intentionally ignored while an
     * editable surface owns focus. Exit editing while retaining the
     * Builder node selection before exercising copy/paste.
     */
    await page.keyboard.press("Escape");

    await page.evaluate(() => {
      const active = document.activeElement;

      if (active instanceof HTMLElement) {
        active.blur();
      }
    });

    await expect
      .poll(() =>
        page.evaluate(() => {
          const active =
            document.activeElement as HTMLElement | null;

          return Boolean(
            active?.closest(
              "input, textarea, select, " +
                "[contenteditable='true'], [role='textbox']",
            ),
          );
        }),
      )
      .toBe(false);

    await expectSelectedNode(
      page,
      FIXTURE_IDS.headingA,
    );

    await page.keyboard.press(
      "ControlOrMeta+c",
    );

    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        }),
    );

    await page.keyboard.press(
      "ControlOrMeta+v",
    );

    await expect
      .poll(
        async () =>
          page
            .getByTestId("builder-selection-toolbar")
            .getAttribute("data-selected-node-id"),
        {
          message:
            "paste should select the independently created node",
        },
      )
      .not.toBe(FIXTURE_IDS.headingA);

    const pastedId =
      await selectedNodeId(page);

    expect(pastedId).not.toBe(
      FIXTURE_IDS.headingA,
    );

    await expectNodeParent(
      page,
      pastedId,
      FIXTURE_IDS.containerA,
    );

    await expect(
      page.locator(
        `.builder-canvas-sandbox ` +
          `[data-node-id='${pastedId}']` +
          `[data-node-type='heading']`,
      ),
    ).toHaveCount(1);

    await saveBuilderNow(
      page,
      fixture.id,
    );

    const persisted =
      await readDisposableBlueprint(
        page.request,
        fixture.id,
      );

    expect(
      persisted.nodes[pastedId],
    ).toBeTruthy();

    expect(
      persisted.nodes[pastedId].parentId,
    ).toBe(FIXTURE_IDS.containerA);

    expect(
      persisted.nodes[pastedId].type,
    ).toBe("heading");

    expect(
      persisted.nodes[pastedId].props,
    ).toEqual(
      persisted.nodes[
        FIXTURE_IDS.headingA
      ].props,
    );

    expect(
      blueprintOccurrences(
        persisted,
        pastedId,
      ),
    ).toBe(1);

    await page.reload({
      waitUntil: "domcontentloaded",
      timeout: 15_000,
    });

    await expectNodeParent(
      page,
      pastedId,
      FIXTURE_IDS.containerA,
    );

    await expect(
      builderNode(page, pastedId),
    ).toHaveCount(1);
  },
);
