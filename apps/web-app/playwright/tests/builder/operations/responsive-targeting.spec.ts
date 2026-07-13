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

type ResponsiveDevice =
  | "desktop"
  | "tablet"
  | "mobile";

const DEVICE_WIDTHS: Record<
  ResponsiveDevice,
  number
> = {
  desktop: 1200,
  tablet: 768,
  mobile: 390,
};

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

async function selectDevice(
  page: Page,
  device: ResponsiveDevice,
) {
  const button = page.getByRole("button", {
    name: `${device} viewport`,
  });

  await expect(button).toBeVisible();
  await button.click();

  const sandbox = page.locator(
    ".builder-canvas-sandbox",
  );

  await expect(sandbox).toBeVisible();

  await expect
    .poll(async () =>
      sandbox.evaluate(
        (element) =>
          Math.round(
            element.getBoundingClientRect().width /
              (
                new DOMMatrix(
                  getComputedStyle(element).transform,
                ).a || 1
              ),
          ),
      ),
    )
    .toBe(DEVICE_WIDTHS[device]);

  await expect(sandbox).toHaveCSS(
    "width",
    `${DEVICE_WIDTHS[device]}px`,
  );
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

for (
  const device of [
    "desktop",
    "tablet",
    "mobile",
  ] as const
) {
  test(
    `@operations @responsive reorder targets correctly on ${device}`,
    async ({ page }) => {
      test.setTimeout(45_000);

      const fixture =
        await createDisposableBuilderPage(
          page.request,
        );

      disposablePageId = fixture.id;

      const persistedBeforeDeviceSwitch =
        await readDisposableBlueprint(
          page.request,
          fixture.id,
        );

      await openDisposableBuilder(
        page,
        fixture,
      );

      await selectDevice(page, device);

      /*
       * Device selection is a canvas concern and must not mutate the
       * persisted Blueprint or create structural changes.
       */
      const persistedAfterDeviceSwitch =
        await readDisposableBlueprint(
          page.request,
          fixture.id,
        );

      expect(
        persistedAfterDeviceSwitch,
      ).toEqual(
        persistedBeforeDeviceSwitch,
      );

      const initialOrder =
        await directChildIds(
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
        builderNode(
          page,
          FIXTURE_IDS.buttonA,
        ),
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

      /*
       * Undo must remain structurally exact on every breakpoint.
       */
      await page.keyboard.press(
        "ControlOrMeta+z",
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
          FIXTURE_IDS.textA,
          FIXTURE_IDS.buttonA,
        ]);

      /*
       * Mobile performs the complete persistence and reload gate.
       */
      if (device === "mobile") {
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
          builderNode(
            page,
            FIXTURE_IDS.buttonA,
          ),
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
        ).toEqual([
          FIXTURE_IDS.headingA,
          FIXTURE_IDS.buttonA,
          FIXTURE_IDS.textA,
        ]);

        expect(
          persisted.nodes[
            FIXTURE_IDS.textA
          ].parentId,
        ).toBe(
          FIXTURE_IDS.containerA,
        );

        await page.reload({
          waitUntil: "domcontentloaded",
          timeout: 15_000,
        });

        await expect(
          page.getByRole("button", {
            name: "mobile viewport",
          }),
        ).toBeVisible();

        /*
         * Canvas store is client-local and may reset after reload,
         * so explicitly re-enter Mobile before checking its geometry.
         */
        await selectDevice(
          page,
          "mobile",
        );

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
