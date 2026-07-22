import { expect, test } from "@playwright/test";

test("RC-15 visual critic route exposes repair planning and simulation", async ({ page }) => {
  const response = await page.goto("/internal/visual-critic/luxury-residential-developer");
  expect(response?.ok()).toBe(true);
  await expect(page.getByTestId("visual-critic-debug")).toBeVisible();
  await expect(page.getByTestId("visual-critic-screenshot")).toBeVisible();
  await expect(page.getByTestId("visual-critic-scores")).toContainText("Critic");
  await expect(page.getByTestId("visual-critic-issues")).toBeVisible();
  await expect(page.getByTestId("visual-critic-recommendations")).toContainText("recommendation only");
  await expect(page.getByTestId("visual-repair-plan")).toContainText("Repair Plan");
  await expect(page.getByTestId("visual-repair-plan")).toContainText("Blueprint mutation disabled");
  await expect(page.getByTestId("repair-simulation")).toContainText("Simulate Repair");
  await expect(page.getByTestId("repair-simulation")).toContainText("no persistence");
  await expect(page.getByTestId("repair-simulation-render")).toBeVisible();
});
