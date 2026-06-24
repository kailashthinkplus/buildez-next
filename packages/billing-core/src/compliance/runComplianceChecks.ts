import { ComplianceResult } from "./types";
import { keywordScanner } from "./scanners/keywordScanner";
import { urlScanner } from "./scanners/urlScanner";

export async function runComplianceChecks(input: {
  html: string;
  js?: string;
  css?: string;
}): Promise<ComplianceResult> {
  const reasons: string[] = [];

  // Keyword scan
  const keywordIssues = keywordScanner(input.html);
  if (keywordIssues.length) reasons.push(...keywordIssues);

  // URL scan
  const urlIssues = urlScanner(input.html);
  if (urlIssues.length) reasons.push(...urlIssues);

  return {
    level: reasons.length ? "WARN" : "PASS",
    reasons,
  };
}
