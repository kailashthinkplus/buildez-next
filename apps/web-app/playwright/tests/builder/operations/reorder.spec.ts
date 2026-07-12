import { expect, request, test } from "@playwright/test";
import { authFile } from "../../../../playwright.config";
import { builderNode, expectSelectedNode } from "../../../helpers/builderAssertions";
import { dragSelectedNodeRelativeToSibling } from "../../../helpers/builderDrag";
import { FIXTURE_IDS, createDisposableBuilderPage, deleteDisposableBuilderPage, openDisposableBuilder, readDisposableBlueprint } from "../../../helpers/builderFixture";
import { saveNow } from "../../../helpers/builderSave";

let disposablePageId: string | null = null;
test.afterEach(async () => {
  test.setTimeout(20_000);
  if (!disposablePageId) return;
  const api = await request.newContext({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000", storageState: authFile });
  try { await deleteDisposableBuilderPage(api, disposablePageId); disposablePageId = null; }
  finally { await api.dispose(); }
});

async function childOrder(page: Parameters<typeof builderNode>[0]) {
  return page.locator(`.builder-canvas-sandbox [data-node-parent-id='${FIXTURE_IDS.containerA}']`)
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-node-id")));
}

test("@operations @reorder moves first sibling to last, undo/redo, save and reload", async ({ page }) => {
  const fixture = await createDisposableBuilderPage(page.request);
  disposablePageId = fixture.id;
  await openDisposableBuilder(page, fixture);
  const original = [FIXTURE_IDS.headingA, FIXTURE_IDS.textA, FIXTURE_IDS.buttonA];
  expect((await readDisposableBlueprint(page.request, fixture.id)).nodes[FIXTURE_IDS.containerA].children).toEqual(original);
  await builderNode(page, FIXTURE_IDS.headingA).click();
  await dragSelectedNodeRelativeToSibling(page, FIXTURE_IDS.headingA, builderNode(page, FIXTURE_IDS.buttonA), "after");
  await expectSelectedNode(page, FIXTURE_IDS.headingA);
  const reordered = [FIXTURE_IDS.textA, FIXTURE_IDS.buttonA, FIXTURE_IDS.headingA];
  expect(await childOrder(page)).toEqual(reordered);
  await page.getByRole("button", { name: "Undo last Builder operation" }).click();
  await expect.poll(() => childOrder(page)).toEqual(original);
  await page.getByRole("button", { name: "Redo last Builder operation" }).click();
  await expect.poll(() => childOrder(page)).toEqual(reordered);
  await saveNow(page, fixture.id);
  expect((await readDisposableBlueprint(page.request, fixture.id)).nodes[FIXTURE_IDS.containerA].children).toEqual(reordered);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect.poll(() => childOrder(page)).toEqual(reordered);
});
