import path from "node:path";
import { expect, test } from "@playwright/test";

import { GOLDEN_WEBSITE_CASES } from "../../../modules/builder-v2/website-engine/golden-websites";

const viewports = Object.freeze({
  desktop: Object.freeze({ width: 1440, height: 1200 }),
  tablet: Object.freeze({ width: 1024, height: 1200 }),
  mobile: Object.freeze({ width: 390, height: 1200 }),
});

for (const fixture of GOLDEN_WEBSITE_CASES) {
  test(`@golden-preview ${fixture.id}`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const runtimeErrors: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => runtimeErrors.push(error.message));

    for (const [viewportName, viewport] of Object.entries(viewports)) {
      await page.setViewportSize(viewport);
      const response = await page.goto(`/internal/golden-preview/${fixture.id}`, { waitUntil: "networkidle" });
      expect(response?.ok(), `${fixture.id}:${viewportName} response`).toBe(true);
      await expect(page.getByTestId("golden-render-status")).toHaveText("ready");
      const render = page.getByTestId("golden-preview-render");
      await expect(render.locator("#buildez-preview-root")).toBeVisible();
      const expectedNodeCount = Number(await render.getAttribute("data-node-count"));
      expect(await render.locator("[data-buildez-node-id]").count(), `${fixture.id}:${viewportName} native node count`).toBe(expectedNodeCount);
      expect(await render.locator("text=/\\{\\{[^}]+\\}\\}/").count(), `${fixture.id}:${viewportName} unresolved semantic nodes`).toBe(0);
      const overflow = await page.evaluate(() => ({ documentWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth }));
      expect(overflow.documentWidth, `${fixture.id}:${viewportName} horizontal overflow`).toBeLessThanOrEqual(overflow.viewportWidth);
      const industry = fixture.industry.replaceAll("_", "-");
      await page.screenshot({ animations: "disabled", caret: "hide", fullPage: true, path: path.resolve(process.cwd(), "golden-captures", industry, fixture.id, `${viewportName}.png`) });
    }

    expect(consoleErrors, `${fixture.id} console errors`).toEqual([]);
    expect(runtimeErrors, `${fixture.id} runtime exceptions`).toEqual([]);
  });
}
