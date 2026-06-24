// /lib/snapshots/renderPageSnapshot.ts
import { renderToReadableStream } from "react-dom/server";
import PageRenderer from "@/modules/runtime/PageRenderer";

export async function renderPageSnapshot({ page, blueprint, themeTokens }) {
  return renderToString(
    PageRenderer({
      pageId: page.id,
      blueprint,
      themeTokens,
    })
  );
}
