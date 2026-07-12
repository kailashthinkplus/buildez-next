import { expect, request, test } from "@playwright/test";
import { authFile } from "../../../../playwright.config";
import { builderNode, expectNodeParent } from "../../../helpers/builderAssertions";
import { dragPaletteWidgetInside, dragPaletteWidgetRelativeToSibling } from "../../../helpers/builderDrag";
import { FIXTURE_IDS, createDisposableBuilderPage, deleteDisposableBuilderPage, openDisposableBuilder, readDisposableBlueprint } from "../../../helpers/builderFixture";
import { saveNow, waitForDirty } from "../../../helpers/builderSave";

let disposablePageId: string | null = null;

test.afterEach(async () => {
  test.setTimeout(20_000);
  if (!disposablePageId) return;
  const api = await request.newContext({
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    storageState: authFile,
  });
  try {
    await deleteDisposableBuilderPage(api, disposablePageId);
    disposablePageId = null;
  } finally {
    await api.dispose();
  }
});

async function openBlocks(page: Parameters<typeof openDisposableBuilder>[0]) {
  await page.getByRole("button", { name: "Blocks" }).click();
  await expect(page.getByTestId("palette-widget-heading")).toBeVisible();
}

test("@operations @palette inserts Heading into a non-empty Container and persists", async ({ page }) => {
  const fixture = await createDisposableBuilderPage(page.request);
  disposablePageId = fixture.id;
  await openDisposableBuilder(page, fixture);
  await openBlocks(page);
  await dragPaletteWidgetInside(page, "heading", builderNode(page, FIXTURE_IDS.containerA));
  await waitForDirty(page);

  const insertedId = await page.getByTestId("builder-selection-toolbar").getAttribute("data-selected-node-id");
  expect(insertedId).toBeTruthy();
  if (!insertedId) return;
  expect(insertedId).not.toBe(FIXTURE_IDS.headingA);
  expect(insertedId).not.toBe(FIXTURE_IDS.headingB);
  await expect(page.locator(`[data-node-id='${insertedId}'][data-node-type='heading']`).first()).toBeVisible();
  await expectNodeParent(page, insertedId, FIXTURE_IDS.containerA);
  await expect(page.getByTestId("builder-selection-toolbar")).toHaveAttribute("data-selected-node-id", insertedId);
  await saveNow(page, fixture.id);
  const persisted = await readDisposableBlueprint(page.request, fixture.id);
  expect(persisted.nodes[insertedId].parentId).toBe(FIXTURE_IDS.containerA);
  expect(persisted.nodes[FIXTURE_IDS.containerA].children.at(-1)).toBe(insertedId);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expectNodeParent(page, insertedId, FIXTURE_IDS.containerA);
});

test("@operations @palette inserts into an emptied Container as its only child", async ({ page }) => {
  const fixture = await createDisposableBuilderPage(page.request);
  disposablePageId = fixture.id;
  await openDisposableBuilder(page, fixture);
  await builderNode(page, FIXTURE_IDS.nested).click();
  await page.getByTitle("Delete element").click();
  await expect(builderNode(page, FIXTURE_IDS.nested)).toHaveCount(0);
  await openBlocks(page);
  await dragPaletteWidgetInside(page, "heading", builderNode(page, FIXTURE_IDS.containerC));
  const insertedId = await page.getByTestId("builder-selection-toolbar").getAttribute("data-selected-node-id");
  expect(insertedId).toBeTruthy();
  if (!insertedId) return;
  await expectNodeParent(page, insertedId, FIXTURE_IDS.containerC);
  await saveNow(page, fixture.id);
  const persisted = await readDisposableBlueprint(page.request, fixture.id);
  expect(persisted.nodes[FIXTURE_IDS.containerC].children).toEqual([insertedId]);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expectNodeParent(page, insertedId, FIXTURE_IDS.containerC);
});

for (const position of ["first", "last"] as const) {
  test(`@operations @palette inserts at ${position} position and persists exact order`, async ({ page }) => {
    const fixture = await createDisposableBuilderPage(page.request);
    disposablePageId = fixture.id;
    await openDisposableBuilder(page, fixture);
    await openBlocks(page);
    const referenceId = position === "first" ? FIXTURE_IDS.headingA : FIXTURE_IDS.buttonA;
    await dragPaletteWidgetRelativeToSibling(
      page,
      "heading",
      builderNode(page, referenceId),
      position === "first" ? "before" : "after",
    );
    const insertedId = await page.getByTestId("builder-selection-toolbar").getAttribute("data-selected-node-id");
    expect(insertedId).toBeTruthy();
    if (!insertedId) return;
    const expected = position === "first"
      ? [insertedId, FIXTURE_IDS.headingA, FIXTURE_IDS.textA, FIXTURE_IDS.buttonA]
      : [FIXTURE_IDS.headingA, FIXTURE_IDS.textA, FIXTURE_IDS.buttonA, insertedId];
    await saveNow(page, fixture.id);
    expect((await readDisposableBlueprint(page.request, fixture.id)).nodes[FIXTURE_IDS.containerA].children).toEqual(expected);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expectNodeParent(page, insertedId, FIXTURE_IDS.containerA);
  });
}
