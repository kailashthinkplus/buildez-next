import { baseHtml } from "./templates/baseHtml";
import crypto from "crypto";

export type PageSnapshotInput = {
  id: string;
  title: string;
  slug: string;
  content: string; // already sanitized editor output
};

export type RenderedPageOutput = {
  slug: string;
  html: string;
  contentHash: string;
  sizeBytes: number;
};

export function renderPage(
  page: PageSnapshotInput
): RenderedPageOutput {
  const body = `
<main id="page">
${page.content}
</main>
`;

  const html = baseHtml({
    title: page.title,
    body,
  });

  const hash = crypto
    .createHash("sha256")
    .update(html)
    .digest("hex");

  return {
    slug: page.slug,
    html,
    contentHash: hash,
    sizeBytes: Buffer.byteLength(html, "utf8"),
  };
}
