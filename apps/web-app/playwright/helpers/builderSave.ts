import { expect, type Page, type Response } from "@playwright/test";

export type BuilderSaveState = "clean" | "dirty" | "saving" | "saved" | "error";

const status = (page: Page) => page.getByTestId("builder-save-status");

async function waitForState(page: Page, state: BuilderSaveState) {
  await expect(status(page), `Builder save state should become ${state}`).toHaveAttribute(
    "data-save-state",
    state,
  );
}

export const waitForDirty = (page: Page) => waitForState(page, "dirty");
export const waitForSaving = (page: Page) => waitForState(page, "saving");
export const waitForSaved = (page: Page) => waitForState(page, "saved");
export const waitForSaveError = (page: Page) => waitForState(page, "error");

export async function saveNow(page: Page, pageId: string): Promise<Response> {
  await waitForDirty(page);
  await status(page).click();
  const button = page.getByTestId("builder-save-now");
  await expect(button).toBeVisible();

  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/builder-v2/blueprints/${pageId}`) &&
      response.request().method() === "POST",
  );
  await button.click();
  await waitForSaving(page);
  const response = await responsePromise;
  expect(response.ok(), `Builder save returned HTTP ${response.status()}`).toBeTruthy();
  await waitForSaved(page);
  return response;
}
