import { expect, request, test } from "@playwright/test";
import { authFile } from "../../../../playwright.config";
import { builderNode, expectNodeParent, expectSelectedNode, saveBuilderNow } from "../../../helpers/builderAssertions";
import { dragSelectedNodeByHandle } from "../../../helpers/builderDrag";
import { FIXTURE_IDS, createDisposableBuilderPage, deleteDisposableBuilderPage, openDisposableBuilder, readDisposableBlueprint } from "../../../helpers/builderFixture";
import { waitForSaveError, waitForSaved, waitForSaving } from "../../../helpers/builderSave";

let disposablePageId: string | null = null;

function expectPersistedMove(blueprint: any) {
  expect(blueprint?.nodes?.[FIXTURE_IDS.buttonA]?.parentId).toBe(FIXTURE_IDS.containerB);
  expect(blueprint.nodes[FIXTURE_IDS.containerA].children).not.toContain(FIXTURE_IDS.buttonA);
  expect(blueprint.nodes[FIXTURE_IDS.containerB].children).toContain(FIXTURE_IDS.buttonA);
  const occurrences = Object.values(blueprint.nodes).flatMap((node: any) => node.children ?? [])
    .filter((id) => id === FIXTURE_IDS.buttonA);
  expect(occurrences).toHaveLength(1);
  expect(Object.keys(blueprint.nodes)).toHaveLength(14);
}

test.afterEach(async () => {
  test.setTimeout(20_000);
  if (!disposablePageId) return;
  const cleanupRequest = await request.newContext({
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    storageState: authFile,
  });
  try {
    await deleteDisposableBuilderPage(cleanupRequest, disposablePageId);
    disposablePageId = null;
  } finally {
    await cleanupRequest.dispose();
  }
});

test("@operations @dnd cross-container drag persists and remains selected", async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  const fixture = await createDisposableBuilderPage(page.request);
  disposablePageId = fixture.id;
  const initialBlueprint = await readDisposableBlueprint(page.request, fixture.id);
  expect(initialBlueprint.nodes[FIXTURE_IDS.buttonA].parentId).toBe(FIXTURE_IDS.containerA);
  expect(initialBlueprint.nodes[FIXTURE_IDS.containerA].children).toContain(FIXTURE_IDS.buttonA);
  expect(initialBlueprint.nodes[FIXTURE_IDS.containerB].children).not.toContain(FIXTURE_IDS.buttonA);
  {
    await openDisposableBuilder(page, fixture);
    await page.evaluate(() => {
      (window as any).__rcT3cDnD = [];
      window.addEventListener("builder:drop-intent", (event) =>
        (window as any).__rcT3cDnD.push({ kind: "intent", detail: (event as CustomEvent).detail })
      );
      window.addEventListener("builder:reparent", (event) =>
        (window as any).__rcT3cDnD.push({ kind: "reparent", detail: (event as CustomEvent).detail })
      );
      for (const type of ["dragstart", "drop", "dragend", "pointerup"]) {
        window.addEventListener(type, (event) =>
          (window as any).__rcT3cDnD.push({
            kind: type,
            detail: { target: (event.target as HTMLElement | null)?.getAttribute?.("data-node-id") ?? null },
          }), true);
      }
    });
    await builderNode(page, FIXTURE_IDS.buttonA).click({ position: { x: 4, y: 4 } });
    await dragSelectedNodeByHandle(page, FIXTURE_IDS.buttonA, builderNode(page, FIXTURE_IDS.containerB));
    const dndEvents = await page.evaluate(() => (window as any).__rcT3cDnD);
    test.info().annotations.push({ type: "dnd-events", description: JSON.stringify(dndEvents) });
    await testInfo.attach("dnd-events", { body: JSON.stringify(dndEvents, null, 2), contentType: "application/json" });
    const observedParent = await builderNode(page, FIXTURE_IDS.buttonA).getAttribute("data-node-parent-id");
    if (observedParent !== FIXTURE_IDS.containerB) {
      throw new Error(`Cross-container drop did not mutate parent. Events: ${JSON.stringify(dndEvents)}`);
    }
    await expectNodeParent(page, FIXTURE_IDS.buttonA, FIXTURE_IDS.containerB);
    await expectSelectedNode(page, FIXTURE_IDS.buttonA);
    await saveBuilderNow(page, fixture.id);
    expectPersistedMove(await readDisposableBlueprint(page.request, fixture.id));
    await page.reload({ waitUntil: "domcontentloaded", timeout: 10_000 });
    await expectNodeParent(page, FIXTURE_IDS.buttonA, FIXTURE_IDS.containerB);
    expectPersistedMove(await readDisposableBlueprint(page.request, fixture.id));
  }
});

test("@operations @save-error failed save remains recoverable and retry persists", async ({ page }) => {
  test.setTimeout(45_000);
  const fixture = await createDisposableBuilderPage(page.request);
  disposablePageId = fixture.id;
  await openDisposableBuilder(page, fixture);
  await builderNode(page, FIXTURE_IDS.buttonA).click({ position: { x: 4, y: 4 } });
  await dragSelectedNodeByHandle(page, FIXTURE_IDS.buttonA, builderNode(page, FIXTURE_IDS.containerB));
  await expectNodeParent(page, FIXTURE_IDS.buttonA, FIXTURE_IDS.containerB);

  let releaseFailure!: () => void;
  const mayFail = new Promise<void>((resolve) => { releaseFailure = resolve; });
  let requestIntercepted!: () => void;
  const intercepted = new Promise<void>((resolve) => { requestIntercepted = resolve; });
  const savePattern = `**/api/builder-v2/blueprints/${fixture.id}`;
  await page.route(savePattern, async (route) => {
    requestIntercepted();
    await mayFail;
    await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Controlled RC save failure" }) });
  });

  await page.getByTestId("builder-save-status").click();
  const failedClick = page.getByTestId("builder-save-now").click();
  await intercepted;
  await waitForSaving(page);
  releaseFailure();
  await failedClick;
  await waitForSaveError(page);
  const unchanged = await readDisposableBlueprint(page.request, fixture.id);
  expect(unchanged.nodes[FIXTURE_IDS.buttonA].parentId).toBe(FIXTURE_IDS.containerA);

  await page.unroute(savePattern);
  const responsePromise = page.waitForResponse((response) =>
    response.url().endsWith(`/api/builder-v2/blueprints/${fixture.id}`) && response.request().method() === "POST"
  );
  await page.getByTestId("builder-save-now").click();
  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
  await waitForSaved(page);
  expectPersistedMove(await readDisposableBlueprint(page.request, fixture.id));
  await page.reload({ waitUntil: "domcontentloaded" });
  await expectNodeParent(page, FIXTURE_IDS.buttonA, FIXTURE_IDS.containerB);
});
