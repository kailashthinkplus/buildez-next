#!/usr/bin/env python3

import json
from pathlib import Path

ROOT = Path("/Users/kailash/buildez")
APP = ROOT / "apps/web-app"
PACKAGE = APP / "package.json"
SPEC = (
    APP
    / "playwright/tests/builder/operations/golden-journeys.spec.ts"
)

package = json.loads(PACKAGE.read_text(encoding="utf-8"))
scripts = package.setdefault("scripts", {})

scripts["test:builder:browser:operations:journeys"] = (
    "playwright test --project=builder-chromium --grep @journeys"
)

PACKAGE.write_text(
    json.dumps(package, indent=2, ensure_ascii=False) + "\n",
    encoding="utf-8",
)

SPEC.parent.mkdir(parents=True, exist_ok=True)

SPEC.write_text(
r'''import { expect, request, test } from "@playwright/test";

import { authFile } from "../../../../playwright.config";
import {
  builderNode,
  expectNodeParent,
  expectSelectedNode,
} from "../../../helpers/builderAssertions";
import {
  dragPaletteWidgetInside,
  dragSelectedNodeByHandle,
} from "../../../helpers/builderDrag";
import {
  FIXTURE_IDS,
  createDisposableBuilderPage,
  deleteDisposableBuilderPage,
  openDisposableBuilder,
  readDisposableBlueprint,
} from "../../../helpers/builderFixture";
import {
  saveNow,
  waitForDirty,
} from "../../../helpers/builderSave";

let disposablePageId: string | null = null;

test.afterEach(async () => {
  test.setTimeout(20_000);

  if (!disposablePageId) {
    return;
  }

  const api = await request.newContext({
    baseURL:
      process.env.PLAYWRIGHT_BASE_URL ??
      "http://127.0.0.1:3000",
    storageState: authFile,
  });

  try {
    await deleteDisposableBuilderPage(
      api,
      disposablePageId,
    );
    disposablePageId = null;
  } finally {
    await api.dispose();
  }
});

async function openBlocks(
  page: Parameters<typeof openDisposableBuilder>[0],
) {
  await page
    .getByRole("button", { name: "Blocks" })
    .click();

  await expect(
    page.getByTestId("palette-widget-heading"),
  ).toBeVisible();
}

async function selectedNodeId(
  page: Parameters<typeof openDisposableBuilder>[0],
) {
  const id = await page
    .getByTestId("builder-selection-toolbar")
    .getAttribute("data-selected-node-id");

  expect(id).toBeTruthy();

  if (!id) {
    throw new Error(
      "Builder selection toolbar has no selected node.",
    );
  }

  return id;
}

test(
  "@operations @journeys landing-page journey inserts, duplicates, saves and reloads",
  async ({ page }) => {
    test.setTimeout(60_000);

    const fixture =
      await createDisposableBuilderPage(
        page.request,
      );

    disposablePageId = fixture.id;

    await openDisposableBuilder(page, fixture);
    await openBlocks(page);

    await dragPaletteWidgetInside(
      page,
      "heading",
      builderNode(page, FIXTURE_IDS.containerB),
    );

    await waitForDirty(page);

    const insertedId = await selectedNodeId(page);

    expect(insertedId).not.toBe(
      FIXTURE_IDS.headingB,
    );

    await expectNodeParent(
      page,
      insertedId,
      FIXTURE_IDS.containerB,
    );

    await page
      .getByTitle("Duplicate element")
      .click();

    const duplicateId = await selectedNodeId(page);

    expect(duplicateId).not.toBe(insertedId);

    await expectSelectedNode(
      page,
      duplicateId,
    );

    await expectNodeParent(
      page,
      duplicateId,
      FIXTURE_IDS.containerB,
    );

    await saveNow(page, fixture.id);

    const persisted =
      await readDisposableBlueprint(
        page.request,
        fixture.id,
      );

    expect(
      persisted.nodes[insertedId]?.parentId,
    ).toBe(FIXTURE_IDS.containerB);

    expect(
      persisted.nodes[duplicateId]?.parentId,
    ).toBe(FIXTURE_IDS.containerB);

    const containerChildren =
      persisted.nodes[
        FIXTURE_IDS.containerB
      ].children;

    expect(containerChildren).toContain(
      insertedId,
    );

    expect(containerChildren).toContain(
      duplicateId,
    );

    expect(
      containerChildren.filter(
        (id: string) =>
          id === insertedId ||
          id === duplicateId,
      ),
    ).toHaveLength(2);

    await page.reload({
      waitUntil: "domcontentloaded",
    });

    await expectNodeParent(
      page,
      insertedId,
      FIXTURE_IDS.containerB,
    );

    await expectNodeParent(
      page,
      duplicateId,
      FIXTURE_IDS.containerB,
    );
  },
);

test(
  "@operations @journeys nested-layout journey moves content, saves and reloads",
  async ({ page }) => {
    test.setTimeout(60_000);

    const fixture =
      await createDisposableBuilderPage(
        page.request,
      );

    disposablePageId = fixture.id;

    await openDisposableBuilder(page, fixture);

    await builderNode(
      page,
      FIXTURE_IDS.textB,
    ).click();

    await expectSelectedNode(
      page,
      FIXTURE_IDS.textB,
    );

    await dragSelectedNodeByHandle(
      page,
      FIXTURE_IDS.textB,
      builderNode(page, FIXTURE_IDS.nested),
    );

    await waitForDirty(page);

    await expectNodeParent(
      page,
      FIXTURE_IDS.textB,
      FIXTURE_IDS.nested,
    );

    await expectSelectedNode(
      page,
      FIXTURE_IDS.textB,
    );

    await saveNow(page, fixture.id);

    const persisted =
      await readDisposableBlueprint(
        page.request,
        fixture.id,
      );

    expect(
      persisted.nodes[
        FIXTURE_IDS.textB
      ].parentId,
    ).toBe(FIXTURE_IDS.nested);

    expect(
      persisted.nodes[
        FIXTURE_IDS.containerB
      ].children,
    ).not.toContain(FIXTURE_IDS.textB);

    expect(
      persisted.nodes[
        FIXTURE_IDS.nested
      ].children,
    ).toContain(FIXTURE_IDS.textB);

    await page.reload({
      waitUntil: "domcontentloaded",
    });

    await expectNodeParent(
      page,
      FIXTURE_IDS.textB,
      FIXTURE_IDS.nested,
    );
  },
);
''',
    encoding="utf-8",
)

print("✓ Added journeys package script")
print(f"✓ Created {SPEC}")
