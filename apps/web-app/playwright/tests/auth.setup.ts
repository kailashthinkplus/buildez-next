import { test as setup, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

import { authFile } from "../../playwright.config";

setup("authenticate Builder RC user", async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_USER_EMAIL and E2E_USER_PASSWORD must be set in the local environment."
    );
  }

  await page.goto("/app/login");
  await page.getByPlaceholder("admin@company.com").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  const [loginResponse] = await Promise.all([
    page.waitForResponse((response) =>
      response.url().endsWith("/api/auth/login") && response.request().method() === "POST"
    ),
    page.getByRole("button", { name: "Continue", exact: true }).click(),
  ]);

  if (!loginResponse.ok()) {
    throw new Error(`Builder login failed with HTTP ${loginResponse.status()}.`);
  }

  await page.waitForURL((url) => !url.pathname.startsWith("/app/login"));
  await expect(page).not.toHaveURL(/\/app\/login(?:\?|$)/);

  await fs.mkdir(path.dirname(authFile), { recursive: true, mode: 0o700 });
  await page.context().storageState({ path: authFile });
});
