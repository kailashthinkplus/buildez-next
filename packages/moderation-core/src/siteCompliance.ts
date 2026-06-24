import { runPageCompliance } from "./pageCompliance";

export type SiteComplianceResult = {
  level: "PASS" | "WARN" | "BLOCK";
  reasons: string[];
  pageViolations: {
    pageId: string;
    level: "WARN" | "BLOCK";
    reasons: string[];
  }[];
};

/* -----------------------------------------
   SITE COMPLIANCE RE-SCAN
------------------------------------------ */
export function runSiteCompliance(
  pages: { id: string; content: string }[]
): SiteComplianceResult {
  const violations: SiteComplianceResult["pageViolations"] = [];
  let hasWarn = false;

  for (const page of pages) {
    const result = runPageCompliance(page.content);

    if (result.level === "BLOCK") {
      violations.push({
        pageId: page.id,
        level: "BLOCK",
        reasons: result.reasons,
      });
    }

    if (result.level === "WARN") {
      hasWarn = true;
      violations.push({
        pageId: page.id,
        level: "WARN",
        reasons: result.reasons,
      });
    }
  }

  if (violations.some(v => v.level === "BLOCK")) {
    return {
      level: "BLOCK",
      reasons: ["PAGE_COMPLIANCE_BLOCK"],
      pageViolations: violations,
    };
  }

  if (hasWarn) {
    return {
      level: "WARN",
      reasons: ["PAGE_COMPLIANCE_WARN"],
      pageViolations: violations,
    };
  }

  return {
    level: "PASS",
    reasons: [],
    pageViolations: [],
  };
}
