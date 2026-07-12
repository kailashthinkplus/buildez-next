import { expect, type Page } from "@playwright/test";
import { saveNow, waitForSaved } from "./builderSave";

export function builderNode(page: Page, nodeId: string) {
  return page.locator(`.builder-canvas-sandbox [data-node-id='${nodeId}']`).first();
}

export async function expectNodeParent(page: Page, nodeId: string, parentId: string) {
  await expect(builderNode(page, nodeId)).toHaveAttribute("data-node-parent-id", parentId);
}

export async function expectSelectedNode(page: Page, nodeId: string) {
  await expect(page.getByTestId("builder-selection-toolbar")).toHaveAttribute("data-selected-node-id", nodeId);
}

export async function waitForBuilderSaved(page: Page) {
  await waitForSaved(page);
}

export async function saveBuilderNow(page: Page, pageId: string) {
  await saveNow(page, pageId);
}
