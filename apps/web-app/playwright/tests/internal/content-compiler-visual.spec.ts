import { expect, test } from "@playwright/test";

const fixtures = [
  ["service-page", "ServiceMatrixCards01"],
  ["product-page", "ProductFeatureStack01"],
  ["restaurant-menu", "MenuPreviewCards01"],
  ["education-catalogue", "CourseCataloguePreview01"],
  ["automotive-service", "VehicleServiceMatrix01"],
] as const;

for (const [name, variant] of fixtures) test(`@visual RC-9D.1 ${name}`, async ({ page }) => {
  const response = await page.goto(`/internal/content-compiler-preview?variant=${variant}`);
  expect(response?.ok()).toBe(true);
  const render = page.getByTestId("content-compiler-preview-render");
  await expect(render.locator("#buildez-preview-root")).toBeVisible();
  await expect(render.locator("[data-buildez-node-id]").first()).toBeVisible();
  expect(await render.locator("[data-buildez-node-id]").count()).toBeGreaterThan(8);
  await expect(render).toHaveScreenshot(`rc-9d1-${name}.png`, { animations: "disabled" });
});
