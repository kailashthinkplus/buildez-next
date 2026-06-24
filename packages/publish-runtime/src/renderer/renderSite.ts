import { renderPage, PageSnapshotInput } from "./renderPage";

export type SiteSnapshotInput = {
  siteId: string;
  snapshotId: string;
  pages: PageSnapshotInput[];
};

export function renderSite(snapshot: SiteSnapshotInput) {
  return snapshot.pages.map(renderPage);
}
