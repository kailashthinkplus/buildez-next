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

export async function saveNow(
  page: Page,
  pageId: string,
): Promise<Response | null> {
  const saveStatus = status(page);

  await expect(saveStatus).toBeVisible();

  const currentState =
    (await saveStatus.getAttribute(
      "data-save-state",
    )) as BuilderSaveState | null;

  if (currentState === "error") {
    throw new Error(
      "Builder save lifecycle is in the error state.",
    );
  }

  /*
   * Autosave can legitimately consume the short-lived dirty state
   * before a browser journey reaches this helper.
   *
   * - dirty: request an explicit manual save
   * - saving: wait for the in-flight autosave
   * - saved: the latest store revision is already persisted
   * - clean: no mutation is pending
   */
  if (
    currentState === "saving"
  ) {
    await waitForSaved(page);
    return null;
  }

  if (
    currentState === "saved" ||
    currentState === "clean"
  ) {
    return null;
  }

  await expect(saveStatus).toHaveAttribute(
    "data-save-state",
    "dirty",
  );

  await saveStatus.click();

  const button =
    page.getByTestId("builder-save-now");

  await expect(button).toBeVisible();

  const responsePromise =
    page.waitForResponse(
      (response) =>
        response
          .url()
          .endsWith(
            `/api/builder-v2/blueprints/${pageId}`,
          ) &&
        response.request().method() === "POST",
    );

  await button.click();
  await waitForSaving(page);

  const response = await responsePromise;

  expect(
    response.ok(),
    `Builder save returned HTTP ${response.status()}`,
  ).toBeTruthy();

  await waitForSaved(page);

  return response;
}
