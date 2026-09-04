import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const authFile = path.join(__dirname, "playwright/.auth/builder-user.json");

export default defineConfig({
  testDir: "./playwright/tests",
  outputDir: "./test-results",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
    },
  },
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "pnpm dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: [
    {
      name: "internal-preview-chromium",
      testMatch: [ /internal\/.*\.spec\.ts/, /golden-websites\/.*\.spec\.ts/ ],
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "builder-chromium",
      testIgnore: [/auth\.setup\.ts/, /internal\/.*\.spec\.ts/, /golden-websites\/.*\.spec\.ts/],
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
    },
  ],
});

export { authFile };
