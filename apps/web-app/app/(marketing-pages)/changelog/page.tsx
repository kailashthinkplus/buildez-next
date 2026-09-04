import { prisma } from "@buildez/db";
import { MarketingInfoPage } from "@/components/marketing/MarketingInfoPage";
import { marketingPages } from "@/components/marketing/marketingPages";

export const dynamic = "force-dynamic";

export default async function Page() {
  const entries = await prisma.changelogEntry.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  const base = marketingPages.changelog;
  const releaseNote = base.sections.find((section) => section.title === "Release availability");
  const dynamicSections = entries.map((entry) => ({
    title: entry.title,
    paragraphs: [entry.summary],
    bullets: entry.bullets.length ? entry.bullets : undefined,
  }));

  const content = {
    ...base,
    sections: dynamicSections.length
      ? [...dynamicSections, ...(releaseNote ? [releaseNote] : [])]
      : base.sections,
  };

  return <MarketingInfoPage page="changelog" contentOverride={content} />;
}
