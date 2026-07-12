import { expect, test } from "@playwright/test";

function builderURL(): string {
  const value = process.env.E2E_BUILDER_URL;
  if (!value) throw new Error("E2E_BUILDER_URL is required for Builder operation tests.");
  return value;
}

test("@operations duplicate selects the created node and undo restores structure", async ({ page }) => {
  await page.goto(builderURL());
  const nodes = page.locator(".builder-canvas-sandbox [data-node-id]");
  await expect(nodes.first()).toBeVisible();
  const beforeCount = await nodes.count();

  const leaf = page.locator(".builder-canvas-sandbox [data-node-id]:not(:has([data-node-id]))").first();
  const sourceId = await leaf.getAttribute("data-node-id");
  expect(sourceId).toBeTruthy();
  await leaf.click({ position: { x: 4, y: 4 } });

  const toolbar = page.getByTestId("builder-selection-toolbar");
  await expect(toolbar).toHaveAttribute("data-selected-node-id", sourceId!);
  await page.getByTitle("Duplicate element").click();

  await expect(nodes).toHaveCount(beforeCount + 1);
  await expect(toolbar).not.toHaveAttribute("data-selected-node-id", sourceId!);

  await page.getByRole("button", { name: "Undo last Builder operation" }).click();
  await expect(nodes).toHaveCount(beforeCount);
});
