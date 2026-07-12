import { expect, test } from "@playwright/test";
import {
  FIXTURE_IDS,
  createDisposableBuilderPage,
  deleteDisposableBuilderPage,
  openDisposableBuilder,
  resetDisposableBuilderPage,
} from "../../../helpers/builderFixture";

test("@operations @fixture disposable page resets through authenticated production contracts", async ({ page }) => {
  const fixture = await createDisposableBuilderPage(page.request);
  try {
    await openDisposableBuilder(page, fixture);
    await expect(page.locator(".builder-canvas-sandbox [data-node-id]")).toHaveCount(14);

    const heading = page.locator(`[data-node-id='${FIXTURE_IDS.headingA}']`);
    await heading.click({ position: { x: 4, y: 4 } });
    await page.getByTitle("Duplicate element").click();
    await expect(page.locator(".builder-canvas-sandbox [data-node-id]")).toHaveCount(15);

    await resetDisposableBuilderPage(page.request, fixture.id);
    await page.reload();
    await expect(page.locator("[data-builder-canvas-scroll='true']")).toBeVisible();
    await expect(page.locator(".builder-canvas-sandbox [data-node-id]")).toHaveCount(14);
    await expect(page.getByTestId("builder-selection-toolbar")).toHaveCount(0);
  } finally {
    await deleteDisposableBuilderPage(page.request, fixture.id);
  }
});
