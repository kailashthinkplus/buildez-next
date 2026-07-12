import { expect, test } from "@playwright/test";

function builderURL(): string {
  const value = process.env.E2E_BUILDER_URL;
  if (!value) {
    throw new Error(
      "E2E_BUILDER_URL must identify an existing Builder page, for example /app/site/page-title--page-id."
    );
  }
  return value;
}

test("authenticated Builder page exposes the RC browser surface", async ({ page }) => {
  await page.goto(builderURL());

  await expect(page).not.toHaveURL(/\/app\/login(?:\?|$)/);
  await expect(page.locator("[data-builder-canvas-scroll='true']")).toBeVisible();
  await expect(page.locator(".builder-canvas-sandbox")).toBeVisible();
});

test("@visual authenticated Builder canvas baseline", async ({ page }) => {
  await page.goto(builderURL());
  const canvas = page.locator("[data-builder-canvas-scroll='true']");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveScreenshot("authenticated-builder-canvas.png", {
    animations: "disabled",
  });
});
