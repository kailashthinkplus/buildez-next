import { expect, test } from "@playwright/test";

test("renders a valid disposable canonical Blueprint and exposes evidence", async ({ page }) => {
  const prompt = "Build a premium architecture studio website";
  const response = await page.goto(`/internal/ai-v10-preview?prompt=${encodeURIComponent(prompt)}`);
  expect(response?.ok()).toBe(true);

  await expect(page.getByTestId("internal-preview-status")).toContainText("INTERNAL · DEVELOPMENT ONLY");
  await expect(page.getByTestId("internal-preview-status")).toContainText("valid");
  await expect(page.getByTestId("internal-preview-status")).toContainText(prompt);

  const render = page.getByTestId("internal-preview-render");
  await expect(render.locator("#buildez-preview-root")).toBeVisible();
  await expect(render.locator("[data-buildez-node-id]").first()).toBeVisible();

  const artifact = page.getByTestId("internal-preview-artifact");
  await artifact.locator("summary").click();
  await expect(artifact).toContainText('"disposable": true');
  await expect(artifact).toContainText('"executed": false');
  await expect(artifact).toContainText('"AI_V10_ENABLED": false');
  await expect(artifact).toContainText('"MAPPER_EXECUTION_ENABLED": false');
  await expect(artifact).toContainText('"network": false');
});
