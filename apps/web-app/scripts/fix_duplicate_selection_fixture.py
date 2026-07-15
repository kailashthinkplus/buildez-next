#!/usr/bin/env python3

from pathlib import Path
import shutil

root = Path("/Users/kailash/buildez")
target = root / "apps/web-app/playwright/tests/builder/operations/duplicate-selection.spec.ts"
backup = target.with_suffix(".spec.ts.legacy-url.bak")

if not target.exists():
    raise SystemExit(f"Missing file: {target}")

shutil.copy2(target, backup)

target.write_text(
'''import { expect, request, test } from "@playwright/test";
import { authFile } from "../../../../playwright.config";
import {
  builderNode,
  expectSelectedNode,
} from "../../../helpers/builderAssertions";
import {
  FIXTURE_IDS,
  createDisposableBuilderPage,
  deleteDisposableBuilderPage,
  openDisposableBuilder,
  readDisposableBlueprint,
} from "../../../helpers/builderFixture";

let disposablePageId: string | null = null;

test.afterEach(async () => {
  test.setTimeout(20_000);

  if (!disposablePageId) return;

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

test(
  "@operations duplicate selects the created node and undo restores structure",
  async ({ page }) => {
    const fixture =
      await createDisposableBuilderPage(
        page.request,
      );

    disposablePageId = fixture.id;

    await openDisposableBuilder(
      page,
      fixture,
    );

    const originalBlueprint =
      await readDisposableBlueprint(
        page.request,
        fixture.id,
      );

    const originalChildren = [
      ...originalBlueprint.nodes[
        FIXTURE_IDS.containerA
      ].children,
    ];

    await builderNode(
      page,
      FIXTURE_IDS.headingA,
    ).click();

    await expectSelectedNode(
      page,
      FIXTURE_IDS.headingA,
    );

    await page
      .getByTitle("Duplicate element")
      .click();

    const duplicatedId =
      await page
        .getByTestId("builder-selection-toolbar")
        .getAttribute("data-selected-node-id");

    expect(duplicatedId).toBeTruthy();
    expect(duplicatedId).not.toBe(
      FIXTURE_IDS.headingA,
    );

    if (!duplicatedId) return;

    await expectSelectedNode(
      page,
      duplicatedId,
    );

    await expect(
      builderNode(page, duplicatedId),
    ).toHaveAttribute(
      "data-node-parent-id",
      FIXTURE_IDS.containerA,
    );

    await page.keyboard.press(
      "ControlOrMeta+z",
    );

    await expect(
      builderNode(page, duplicatedId),
    ).toHaveCount(0);

    const afterUndo =
      await readDisposableBlueprint(
        page.request,
        fixture.id,
      );

    expect(
      afterUndo.nodes[
        FIXTURE_IDS.containerA
      ].children,
    ).toEqual(originalChildren);
  },
);
''',
encoding="utf-8",
)

print(f"✓ Updated: {target}")
print(f"✓ Backup:  {backup}")
