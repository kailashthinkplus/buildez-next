import { NextResponse } from "next/server";
import { renderPage } from "@/lib/runtime/render-page";

/**
 * PUBLIC RUNTIME RENDERER
 *
 * URL SHAPE:
 *   /api/render/:siteSlug/:pageSlug
 *
 * EXAMPLES:
 *   /api/render/home/new-page
 */

export async function GET(
  req: Request,
  context: { params: Promise<{ slug?: string[] }> }
) {
  console.log("\n==============================");
  console.log("🖼️ API RENDER HIT");

  /* ----------------------------------------------------------
     PARAMS (Next 15 requires await)
  ---------------------------------------------------------- */
  const { slug = [] } = await context.params;

  console.log("🔗 RAW SLUG:", slug);

  if (slug.length < 2) {
    console.log("❌ INVALID SLUG LENGTH");
    return new NextResponse("Not Found", { status: 404 });
  }

  const [siteSlug, pageSlug] = slug;

  console.log("🏠 SITE SLUG:", siteSlug);
  console.log("📄 PAGE SLUG:", pageSlug);

  if (!siteSlug || !pageSlug) {
    console.log("❌ INVALID SLUG VALUES");
    return new NextResponse("Not Found", { status: 404 });
  }

  /* ----------------------------------------------------------
     RENDER PAGE
  ---------------------------------------------------------- */
  const result = await renderPage({ siteSlug, pageSlug });

  if (!result) {
    console.log("❌ RENDER RESULT NULL");
    return new NextResponse("Not Found", { status: 404 });
  }

  const { page } = result;

  /* ----------------------------------------------------------
     RESPONSE
  ---------------------------------------------------------- */
  const cssHref = `/api/runtime/css/${siteSlug}/${pageSlug}`;

  if (result.mode === "builder-v2") {
    console.log("⚛️ BUILDER V2 PAGE → REDIRECT APP ROUTER");
    return NextResponse.redirect(new URL(`/${siteSlug}/${pageSlug}`, req.url));
  }

  const { html } = result;

  console.log("🔗 CSS LINK:", cssHref);
  console.log("🧾 HTML SIZE:", html.length);

  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(page.title)}</title>
  <link rel="stylesheet" href="${cssHref}" />
</head>
<body>
  <div id="buildez-preview-root">
${html}
  </div>
</body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    }
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
