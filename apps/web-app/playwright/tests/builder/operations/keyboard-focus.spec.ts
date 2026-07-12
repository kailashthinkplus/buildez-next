import { expect, request, test } from "@playwright/test";
import { authFile } from "../../../../playwright.config";
import { builderNode } from "../../../helpers/builderAssertions";
import { FIXTURE_IDS, createDisposableBuilderPage, deleteDisposableBuilderPage, openDisposableBuilder } from "../../../helpers/builderFixture";

let disposablePageId: string | null = null;
const modifier = process.platform === "darwin" ? "Meta" : "Control";
test.afterEach(async () => {
  test.setTimeout(20_000);
  if (!disposablePageId) return;
  const api = await request.newContext({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000", storageState: authFile });
  try { await deleteDisposableBuilderPage(api, disposablePageId); disposablePageId = null; }
  finally { await api.dispose(); }
});

test("@operations @keyboard shortcuts work from chrome and remain safe in editors", async ({ page }) => {
  const fixture = await createDisposableBuilderPage(page.request);
  disposablePageId = fixture.id;
  await openDisposableBuilder(page, fixture);

  await builderNode(page, FIXTURE_IDS.buttonA).click();
  const handle = page.getByTestId("builder-node-drag-handle");
  await handle.focus();
  await page.keyboard.press("Delete");
  await expect(builderNode(page, FIXTURE_IDS.buttonA)).toHaveCount(0);
  await page.keyboard.press(`${modifier}+z`);
  await expect(builderNode(page, FIXTURE_IDS.buttonA)).toBeVisible();

  await builderNode(page, FIXTURE_IDS.buttonA).click();
  await handle.focus();
  await page.keyboard.press(`${modifier}+d`);
  await expect(page.locator(`[data-node-parent-id='${FIXTURE_IDS.containerA}'][data-node-type='button']`)).toHaveCount(2);

  const heading = builderNode(page, FIXTURE_IDS.headingA);
  await heading.click();
  await heading.focus();
  await page.keyboard.press("Backspace");
  await page.keyboard.press(`${modifier}+d`);
  await expect(builderNode(page, FIXTURE_IDS.headingA)).toBeVisible();
  await expect(page.locator(`[data-node-parent-id='${FIXTURE_IDS.containerA}'][data-node-type='heading']`)).toHaveCount(1);

  await builderNode(page, FIXTURE_IDS.buttonA).click();
  const inspectorInput = page.getByRole("textbox", { name: "Button label" });
  await expect(inspectorInput).toBeVisible();
  await inspectorInput.focus();
  const buttonsBefore = await page.locator(`[data-node-parent-id='${FIXTURE_IDS.containerA}'][data-node-type='button']`).count();
  await page.keyboard.press("Backspace");
  await page.keyboard.press(`${modifier}+d`);
  await expect(builderNode(page, FIXTURE_IDS.buttonA)).toBeVisible();
  await expect(page.locator(`[data-node-parent-id='${FIXTURE_IDS.containerA}'][data-node-type='button']`)).toHaveCount(buttonsBefore);
});
