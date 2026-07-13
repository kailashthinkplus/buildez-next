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
            typeof id === "string" && id.length > 0,
        ),
    );
}

async function setBuilderZoom(
  page: Page,
  zoom: 100 | 80 | 50,
) {
  const control = page.getByLabel("Builder zoom");

  await expect(control).toBeVisible();

  await control.selectOption(String(zoom));

  await expect(control).toHaveValue(String(zoom));

  const sandbox = page.locator(".builder-canvas-sandbox");

  await expect(sandbox).toHaveCSS(
    "transform",
    zoom === 100
      ? "matrix(1, 0, 0, 1, 0, 0)"
      : zoom === 80
        ? "matrix(0.8, 0, 0, 0.8, 0, 0)"
        : "matrix(0.5, 0, 0, 0.5, 0, 0)",
  );
}

test.afterEach(async () => {
  test.setTimeout(20_000);

  if (!disposablePageId) {
    return;
  }

  const cleanupRequest = await request.newContext({
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

for (const zoom of [100, 80, 50] as const) {
  test(
    `@operations @zoom sibling reorder targets correctly at ${zoom}%`,
    async ({ page }) => {
      test.setTimeout(45_000);

      const fixture =
        await createDisposableBuilderPage(page.request);

      disposablePageId = fixture.id;

      await openDisposableBuilder(page, fixture);

      await setBuilderZoom(page, zoom);

      const initialOrder = await directChildIds(
        page,
        FIXTURE_IDS.containerA,
      );

      expect(initialOrder).toEqual([
        FIXTURE_IDS.headingA,
        FIXTURE_IDS.textA,
        FIXTURE_IDS.buttonA,
      ]);

      await builderNode(
        page,
        FIXTURE_IDS.textA,
      ).click({
        position: {
          x: 4,
          y: 4,
        },
      });

      await expectSelectedNode(
        page,
        FIXTURE_IDS.textA,
      );

      await dragSelectedNodeRelativeToSibling(
        page,
        FIXTURE_IDS.textA,
        builderNode(page, FIXTURE_IDS.buttonA),
        "after",
      );

      await expectNodeParent(
        page,
        FIXTURE_IDS.textA,
        FIXTURE_IDS.containerA,
      );

      await expectSelectedNode(
        page,
        FIXTURE_IDS.textA,
      );

      const movedOrder = await directChildIds(
        page,
        FIXTURE_IDS.containerA,
      );

      expect(movedOrder).toEqual([
        FIXTURE_IDS.headingA,
        FIXTURE_IDS.buttonA,
        FIXTURE_IDS.textA,
      ]);

      /*
       * Verify zoom-aware operation history restores the exact
       * original sibling order.
       */
      await page.keyboard.press("ControlOrMeta+z");

      await expect
        .poll(async () =>
          directChildIds(
            page,
            FIXTURE_IDS.containerA,
          ),
        )
        .toEqual([
          FIXTURE_IDS.headingA,
          FIXTURE_IDS.textA,
          FIXTURE_IDS.buttonA,
        ]);

      /*
       * Reapply the operation so the lowest supported zoom can
       * certify production save, API persistence and reload.
       */
      if (zoom === 50) {
        await builderNode(
          page,
          FIXTURE_IDS.textA,
        ).click({
          position: {
            x: 4,
            y: 4,
          },
        });

        await dragSelectedNodeRelativeToSibling(
          page,
          FIXTURE_IDS.textA,
          builderNode(page, FIXTURE_IDS.buttonA),
          "after",
        );

        await expect
          .poll(async () =>
            directChildIds(
              page,
              FIXTURE_IDS.containerA,
            ),
          )
          .toEqual([
            FIXTURE_IDS.headingA,
            FIXTURE_IDS.buttonA,
            FIXTURE_IDS.textA,
          ]);

        await saveBuilderNow(page, fixture.id);

        const persisted =
          await readDisposableBlueprint(
            page.request,
            fixture.id,
          );

        expect(
          persisted.nodes[
            FIXTURE_IDS.containerA
          ].children,
        ).toEqual([
          FIXTURE_IDS.headingA,
          FIXTURE_IDS.buttonA,
          FIXTURE_IDS.textA,
        ]);

        expect(
          persisted.nodes[
            FIXTURE_IDS.textA
          ].parentId,
        ).toBe(FIXTURE_IDS.containerA);

        await page.reload({
          waitUntil: "domcontentloaded",
          timeout: 15_000,
        });

        await expect(
          page.getByLabel("Builder zoom"),
        ).toBeVisible();

        await expectNodeParent(
          page,
          FIXTURE_IDS.textA,
          FIXTURE_IDS.containerA,
        );

        await expect
          .poll(async () =>
            directChildIds(
              page,
              FIXTURE_IDS.containerA,
            ),
          )
          .toEqual([
            FIXTURE_IDS.headingA,
            FIXTURE_IDS.buttonA,
            FIXTURE_IDS.textA,
          ]);
      }
    },
  );
}
