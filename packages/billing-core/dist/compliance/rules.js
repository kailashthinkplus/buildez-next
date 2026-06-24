import { runKeywordScan } from "./scanners/keywordScanner";
export async function runComplianceChecks(site) {
    const violations = [];
    const keywordResult = runKeywordScan(site);
    if (keywordResult.length > 0) {
        violations.push(...keywordResult);
    }
    if (violations.length > 0) {
        return {
            allowed: false,
            level: "BLOCK",
            reasons: violations,
        };
    }
    return {
        allowed: true,
        level: "PASS",
    };
}
