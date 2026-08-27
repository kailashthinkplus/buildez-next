import assert from "node:assert/strict";
import test from "node:test";

import { buildInsightAgents, buildInsightReport } from "./insightEngine";

const input = {
  site: {
    id: "site-1",
    name: "Northstar Studio",
    slug: "northstar",
    status: "PUBLISHED",
    settings: {},
  },
  pages: [
    {
      id: "page-1",
      title: "Home",
      slug: "home",
      status: "PUBLISHED" as const,
      metadata: {},
    },
  ],
  files: [
    {
      path: "src/pages/Home.tsx",
      content:
        "export default function Home(){return <main><h1>Northstar</h1><img src='/hero.jpg'/><button><span>→</span></button></main>}",
    },
  ],
};

test("builds a complete multi-category report", () => {
  const report = buildInsightReport(input);
  assert.equal(report.categories.length, 6);
  assert.equal(report.pages.length, 1);
  assert.equal(report.vitals.length, 6);
  assert.ok(report.findings.some((finding) => finding.category === "seo"));
  assert.ok(report.findings.some((finding) => finding.category === "geo"));
  assert.ok(report.stats.checksTotal > report.stats.checksPassed);
});

test("supports page-scoped reports and specialist agents", () => {
  const report = buildInsightReport({ ...input, pageId: "page-1" });
  const agents = buildInsightAgents(report);
  assert.equal(report.scope, "page");
  assert.equal(report.page?.id, "page-1");
  assert.equal(agents.length, 10);
  assert.ok(agents.every((agent) => agent.score >= 0 && agent.score <= 100));
});
