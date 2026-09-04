import { expect, test } from "@playwright/test";

import { GOLDEN_WEBSITE_CASES } from "../../../modules/builder-v2/website-engine/golden-websites";
import { GOLDEN_CAPTURE_VIEWPORTS, goldenCaptureUrl } from "./captureConfig";

const captureBaseUrl = process.env.GOLDEN_WEBSITE_CAPTURE_URL;

test.describe("RC-11 golden website multi-viewport capture", () => {
  test.skip(!captureBaseUrl, "Set GOLDEN_WEBSITE_CAPTURE_URL when a golden preview route is available. Reference comparison is intentionally deferred.");

  for (const fixture of GOLDEN_WEBSITE_CASES) {
    for (const [viewportName, viewport] of Object.entries(GOLDEN_CAPTURE_VIEWPORTS)) {
      test(`${fixture.id} ${viewportName}`, async ({ page }, testInfo) => {
        await page.setViewportSize(viewport);
        const response = await page.goto(goldenCaptureUrl(captureBaseUrl!, fixture.id));
        expect(response?.ok()).toBe(true);
        await expect(page.locator("#buildez-preview-root")).toBeVisible();
        await page.screenshot({ path: testInfo.outputPath(`${fixture.id}-${viewportName}.png`), fullPage: true, animations: "disabled" });
      });
    }
  }
});
