import { prisma } from "@buildez/db";
import { generateRuntimeHTML } from "@/modules/builder/runtime/generateRuntimeHTML";
import { generateRuntimeCSS } from "@/modules/builder/runtime/generateRuntimeCSS";

export async function renderPage({
  siteSlug,
  pageSlug,
}: {
  siteSlug: string;
  pageSlug: string;
}) {
  console.log("\n==============================");
  console.log("🧱 RENDER PAGE START");
  console.log("🏠 SITE SLUG:", siteSlug);
  console.log("📄 PAGE SLUG:", pageSlug);

  /* ----------------------------------------------------------
     1️⃣ RESOLVE SITE CANDIDATES (BY SLUG ONLY)
  ---------------------------------------------------------- */
  const sites = await prisma.site.findMany({
    where: {
      slug: siteSlug,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log(
    "🏢 SITE CANDIDATES:",
    sites.map((s) => `${s.id}:${s.status}`)
  );

  if (!sites.length) {
    console.log("❌ NO SITE WITH THIS SLUG");
    return null;
  }

  /* ----------------------------------------------------------
     2️⃣ RESOLVE PAGE WITHIN THOSE SITES
  ---------------------------------------------------------- */
  const page = await prisma.page.findFirst({
    where: {
      slug: pageSlug,
      status: "PUBLISHED",
      siteId: {
        in: sites.map((s) => s.id),
      },
    },
    include: {
      blueprint: true,
      site: true,
    },
  });

  console.log("📦 PAGE FOUND?", Boolean(page));

  if (!page) {
    console.log("❌ PAGE NOT FOUND IN ANY SITE");
    return null;
  }

  /* ----------------------------------------------------------
     3️⃣ ENFORCE SITE PUBLISHED STATE
  ---------------------------------------------------------- */
  if (page.site.status !== "PUBLISHED") {
    console.log(
      "❌ PAGE FOUND BUT SITE NOT PUBLISHED:",
      page.site.id,
      page.site.status
    );
    return null;
  }

  console.log("✅ PAGE ID:", page.id);
  console.log("✅ SITE ID:", page.siteId);
  console.log("🧬 HAS BLUEPRINT?", Boolean(page.blueprint));

  if (!page.blueprint?.data) {
    console.log("❌ BLUEPRINT MISSING");
    return null;
  }

  /* ----------------------------------------------------------
     4️⃣ RENDER
  ---------------------------------------------------------- */
  const blueprintTree = page.blueprint.data;

  console.log("🌳 BLUEPRINT ROOT KEYS:", Object.keys(blueprintTree));

  const html = generateRuntimeHTML(blueprintTree);
  const css = generateRuntimeCSS();

  console.log("🧾 HTML LENGTH:", html?.length || 0);
  console.log("🎨 CSS LENGTH:", css?.length || 0);
  console.log("✅ RENDER PAGE COMPLETE");

  return {
    html,
    css,
    page,
  };
}
