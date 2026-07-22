import { expect, test } from "@playwright/test";
import { PREMIUM_FIXTURES } from "../../../modules/builder-v2/ai-v11/benchmarks/premium/registry";

const V11_PREMIUM_FIXTURE_IDS = PREMIUM_FIXTURES.map((fixture) => fixture.fixtureId);

test("V11 premium index exposes compiled candidates", async ({ page }) => {
  expect((await page.goto("/internal/v11-visual"))?.ok()).toBe(true);
  for (const id of V11_PREMIUM_FIXTURE_IDS)
    await expect(
      page.getByRole("link", { name: new RegExp(id) }),
    ).toBeVisible();
});

for (const id of V11_PREMIUM_FIXTURE_IDS)
  test(`V11 premium candidate ${id} uses compiler output and PublishedPageRenderer`, async ({
    page,
  }) => {
    expect(
      (
        await page.goto(`/internal/v11-visual/${id}`, {
          waitUntil: "networkidle",
        })
      )?.ok(),
    ).toBe(true);
    const status = page.getByTestId("v11-visual-status");
    await expect(status).toHaveAttribute(
      "data-production-renderer",
      "PublishedPageRenderer",
    );
    await expect(status).toHaveAttribute("data-database-write", "false");
    expect(
      Number(await status.getAttribute("data-node-count")),
    ).toBeGreaterThan(0);
    await expect(page.getByTestId("v11-visual-surface")).toBeVisible();
    await expect(page.getByTestId("v11-compilation-diagnostics")).toBeVisible();
    expect(
      (await page.goto(`/internal/v11-visual/${id}?mode=reference`))?.status(),
    ).toBe(404);
  });
