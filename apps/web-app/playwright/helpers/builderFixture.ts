import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const FIXTURE_IDS = {
  root: "rc-t3b-page",
  sectionA: "rc-t3b-section-a",
  containerA: "rc-t3b-container-a",
  headingA: "rc-t3b-heading-a",
  textA: "rc-t3b-text-a",
  buttonA: "rc-t3b-button-a",
  sectionB: "rc-t3b-section-b",
  containerB: "rc-t3b-container-b",
  headingB: "rc-t3b-heading-b",
  textB: "rc-t3b-text-b",
  sectionC: "rc-t3b-section-c",
  containerC: "rc-t3b-container-c",
  nested: "rc-t3b-container-nested",
  textC: "rc-t3b-text-c",
} as const;

type DisposablePage = { id: string; slug: string; siteSlug: string; builderPath: string };
export const DISPOSABLE_PAGE_PREFIX = "RC T3B Disposable ";

export function createOperationFixtureBlueprint() {
  const now = "2026-07-12T00:00:00.000Z";
  const node = (id: string, type: string, parentId: string | null, children: string[], props = {}, style = {}) => ({
    id, type, parentId, children, props, style, locked: false, hidden: false,
  });
  return {
    metadata: { version: 2, title: "RC-T3B Disposable Operations", createdAt: now, updatedAt: now },
    theme: { id: "default", name: "Default", preset: "default", tokens: {} },
    root: FIXTURE_IDS.root,
    nodes: {
      [FIXTURE_IDS.root]: node(FIXTURE_IDS.root, "page", null, [FIXTURE_IDS.sectionA, FIXTURE_IDS.sectionB, FIXTURE_IDS.sectionC]),
      [FIXTURE_IDS.sectionA]: node(FIXTURE_IDS.sectionA, "section", FIXTURE_IDS.root, [FIXTURE_IDS.containerA], { widthMode: "boxed" }, { minHeight: 520, padding: 48 }),
      [FIXTURE_IDS.containerA]: node(FIXTURE_IDS.containerA, "container", FIXTURE_IDS.sectionA, [FIXTURE_IDS.headingA, FIXTURE_IDS.textA, FIXTURE_IDS.buttonA], { layout: "flex", direction: "column" }, { display: "flex", flexDirection: "column", gap: 20, minHeight: 320, padding: 24 }),
      [FIXTURE_IDS.headingA]: node(FIXTURE_IDS.headingA, "heading", FIXTURE_IDS.containerA, [], { text: "RC Heading A", level: "h2" }),
      [FIXTURE_IDS.textA]: node(FIXTURE_IDS.textA, "text", FIXTURE_IDS.containerA, [], { text: "RC Text A", html: "<p>RC Text A</p>" }),
      [FIXTURE_IDS.buttonA]: node(FIXTURE_IDS.buttonA, "button", FIXTURE_IDS.containerA, [], { label: "RC Button A", text: "RC Button A", href: "#rc" }),
      [FIXTURE_IDS.sectionB]: node(FIXTURE_IDS.sectionB, "section", FIXTURE_IDS.root, [FIXTURE_IDS.containerB], { widthMode: "boxed" }, { minHeight: 520, padding: 48 }),
      [FIXTURE_IDS.containerB]: node(FIXTURE_IDS.containerB, "container", FIXTURE_IDS.sectionB, [FIXTURE_IDS.headingB, FIXTURE_IDS.textB], { layout: "flex", direction: "column" }, { display: "flex", flexDirection: "column", gap: 20, minHeight: 320, padding: 24 }),
      [FIXTURE_IDS.headingB]: node(FIXTURE_IDS.headingB, "heading", FIXTURE_IDS.containerB, [], { text: "RC Heading B", level: "h2" }),
      [FIXTURE_IDS.textB]: node(FIXTURE_IDS.textB, "text", FIXTURE_IDS.containerB, [], { text: "RC Text B", html: "<p>RC Text B</p>" }),
      [FIXTURE_IDS.sectionC]: node(FIXTURE_IDS.sectionC, "section", FIXTURE_IDS.root, [FIXTURE_IDS.containerC], { widthMode: "boxed" }, { minHeight: 760, padding: 48 }),
      [FIXTURE_IDS.containerC]: node(FIXTURE_IDS.containerC, "container", FIXTURE_IDS.sectionC, [FIXTURE_IDS.nested], { layout: "flex", direction: "column" }, { display: "flex", flexDirection: "column", gap: 20, minWidth: 1320, minHeight: 320, padding: 24 }),
      [FIXTURE_IDS.nested]: node(FIXTURE_IDS.nested, "container", FIXTURE_IDS.containerC, [FIXTURE_IDS.textC], { layout: "flex", direction: "column" }, { display: "flex", flexDirection: "column", minHeight: 240, padding: 24 }),
      [FIXTURE_IDS.textC]: node(FIXTURE_IDS.textC, "text", FIXTURE_IDS.nested, [], { text: "RC Nested Text", html: "<p>RC Nested Text</p>" }),
    },
  };
}

export async function createDisposableBuilderPage(request: APIRequestContext): Promise<DisposablePage> {
  const siteSlug = process.env.E2E_SITE_SLUG ?? "home";
  const title = `${DISPOSABLE_PAGE_PREFIX}${crypto.randomUUID().slice(0, 8)}`;
  const response = await request.post("/api/pages", { data: { title, siteSlug } });
  expect(response.ok(), await response.text()).toBeTruthy();
  const payload = await response.json();
  const created = payload?.data?.data;
  expect(created?.id).toBeTruthy();
  await resetDisposableBuilderPage(request, created.id);
  return { id: created.id, slug: created.slug, siteSlug, builderPath: `/app/${siteSlug}/${created.slug}-${created.id}` };
}

export async function resetDisposableBuilderPage(request: APIRequestContext, pageId: string) {
  const response = await request.post(`/api/builder-v2/blueprints/${pageId}`, {
    data: { blueprint: createOperationFixtureBlueprint() },
  });
  expect(response.ok(), await response.text()).toBeTruthy();
}

export async function deleteDisposableBuilderPage(request: APIRequestContext, pageId: string) {
  const response = await request.delete(`/api/pages/${pageId}`);
  expect(response.ok(), await response.text()).toBeTruthy();
}

export async function readDisposableBlueprint(request: APIRequestContext, pageId: string) {
  const response = await request.get(`/api/builder-v2/blueprints/${pageId}`);
  expect(response.ok(), await response.text()).toBeTruthy();
  const payload = await response.json();
  return payload?.data?.blueprint ?? payload?.blueprint ?? payload?.data?.data?.blueprint;
}

export async function openDisposableBuilder(page: Page, fixture: DisposablePage) {
  await page.goto(fixture.builderPath);
  await expect(page.locator("[data-builder-canvas-scroll='true']")).toBeVisible();
  await expect(page.locator(`[data-node-id='${FIXTURE_IDS.containerA}']`)).toBeVisible();
  await expect(page.locator(`[data-node-id='${FIXTURE_IDS.containerB}']`)).toBeVisible();
}
