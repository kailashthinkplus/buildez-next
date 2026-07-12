import { expect, request, test } from "@playwright/test";
import { authFile } from "../../../../playwright.config";
import { builderNode, expectNodeParent, expectSelectedNode } from "../../../helpers/builderAssertions";
import { FIXTURE_IDS, createDisposableBuilderPage, deleteDisposableBuilderPage, openDisposableBuilder, readDisposableBlueprint } from "../../../helpers/builderFixture";

let disposablePageId: string | null = null;
test.afterEach(async () => {
  test.setTimeout(20_000);
  if (!disposablePageId) return;
  const api = await request.newContext({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000", storageState: authFile });
  try { await deleteDisposableBuilderPage(api, disposablePageId); disposablePageId = null; }
  finally { await api.dispose(); }
});

async function startSelectedDrag(page: Parameters<typeof builderNode>[0], nodeId: string) {
  await builderNode(page, nodeId).click({ position: { x: 4, y: 4 } });
  const handle = page.getByTestId("builder-node-drag-handle");
  await handle.hover();
  const box = await handle.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 10, { steps: 4 });
  await expect(page.getByTestId("builder-shell")).toHaveAttribute("data-dnd-active-id", nodeId);
}

async function expectUnchanged(page: Parameters<typeof builderNode>[0], pageId: string) {
  await expectNodeParent(page, FIXTURE_IDS.buttonA, FIXTURE_IDS.containerA);
  await expectSelectedNode(page, FIXTURE_IDS.buttonA);
  await expect(page.getByTestId("builder-save-status")).toHaveAttribute("data-save-state", "clean");
  const blueprint = await readDisposableBlueprint(page.request, pageId);
  expect(blueprint.nodes[FIXTURE_IDS.buttonA].parentId).toBe(FIXTURE_IDS.containerA);
  expect(Object.keys(blueprint.nodes)).toHaveLength(14);
}

async function releaseOver(page: Parameters<typeof builderNode>[0], targetId: string) {
  const box = await builderNode(page, targetId).boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 16 });
  await page.mouse.up();
}

test("@operations @invalid-dnd Escape cancels active native drag without mutation", async ({ page }) => {
  const fixture = await createDisposableBuilderPage(page.request); disposablePageId = fixture.id;
  await openDisposableBuilder(page, fixture);
  await startSelectedDrag(page, FIXTURE_IDS.buttonA);
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("builder-shell")).toHaveAttribute("data-dnd-active-id", "");
  await page.mouse.up();
  await expectUnchanged(page, fixture.id);
});

test("@operations @invalid-dnd release over Builder header leaves structure unchanged", async ({ page }) => {
  const fixture = await createDisposableBuilderPage(page.request); disposablePageId = fixture.id;
  await openDisposableBuilder(page, fixture);
  await startSelectedDrag(page, FIXTURE_IDS.buttonA);
  const header = page.locator("header.builder-chrome");
  const box = await header.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 16 });
  await expect(page.getByTestId("builder-shell")).toHaveAttribute("data-dnd-valid", "false");
  await page.mouse.up();
  await expectUnchanged(page, fixture.id);
});

test("@operations @invalid-dnd drop onto self is an atomic no-op", async ({ page }) => {
  const fixture = await createDisposableBuilderPage(page.request); disposablePageId = fixture.id;
  await openDisposableBuilder(page, fixture);
  await startSelectedDrag(page, FIXTURE_IDS.buttonA);
  await releaseOver(page, FIXTURE_IDS.buttonA);
  await expectUnchanged(page, fixture.id);
});

test("@operations @invalid-dnd parent into descendant is rejected without history", async ({ page }) => {
  const fixture = await createDisposableBuilderPage(page.request); disposablePageId = fixture.id;
  await openDisposableBuilder(page, fixture);
  await startSelectedDrag(page, FIXTURE_IDS.containerC);
  await releaseOver(page, FIXTURE_IDS.nested);
  await expectNodeParent(page, FIXTURE_IDS.containerC, FIXTURE_IDS.sectionC);
  await expectSelectedNode(page, FIXTURE_IDS.containerC);
  await expect(page.getByTestId("builder-save-status")).toHaveAttribute("data-save-state", "clean");
  expect((await readDisposableBlueprint(page.request, fixture.id)).nodes[FIXTURE_IDS.containerC].parentId).toBe(FIXTURE_IDS.sectionC);
});

test("@operations @invalid-dnd Section cannot be reparented under a widget parent", async ({ page }) => {
  const fixture = await createDisposableBuilderPage(page.request); disposablePageId = fixture.id;
  await openDisposableBuilder(page, fixture);
  await startSelectedDrag(page, FIXTURE_IDS.sectionA);
  await releaseOver(page, FIXTURE_IDS.buttonA);
  await expectNodeParent(page, FIXTURE_IDS.sectionA, FIXTURE_IDS.root);
  await expectSelectedNode(page, FIXTURE_IDS.sectionA);
  await expect(page.getByTestId("builder-save-status")).toHaveAttribute("data-save-state", "clean");
  expect((await readDisposableBlueprint(page.request, fixture.id)).nodes[FIXTURE_IDS.sectionA].parentId).toBe(FIXTURE_IDS.root);
});
