import { keywordScanner } from "./scanners/keywordScanner";
import { urlScanner } from "./scanners/urlScanner";
export async function runComplianceChecks(input) {
    const reasons = [];
    // Keyword scan
    const keywordIssues = keywordScanner(input.html);
    if (keywordIssues.length)
        reasons.push(...keywordIssues);
    // URL scan
    const urlIssues = urlScanner(input.html);
    if (urlIssues.length)
        reasons.push(...urlIssues);
    return {
        level: reasons.length ? "WARN" : "PASS",
        reasons,
    };
}
