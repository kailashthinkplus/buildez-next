import { SiteSnapshot } from "../types";

const BANNED_KEYWORDS = [
  "porn",
  "xxx",
  "sex video",
  "child abuse",
  "drugs for sale",
  "fake passport",
  "hacking service",
  "terrorist",
];

export function runKeywordScan(site: SiteSnapshot): string[] {
  const violations: string[] = [];

  const contentBlob = [
    site.name,
    site.slug,
    ...site.pages.map(p => `${p.title} ${p.content}`),
  ]
    .join(" ")
    .toLowerCase();

  for (const keyword of BANNED_KEYWORDS) {
    if (contentBlob.includes(keyword)) {
      violations.push(`BANNED_KEYWORD:${keyword}`);
    }
  }

  return violations;
}
