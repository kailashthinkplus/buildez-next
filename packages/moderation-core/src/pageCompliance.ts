export type PageComplianceResult = {
  level: "PASS" | "WARN" | "BLOCK";
  reasons: string[];
};

/* -----------------------------------------
   PAGE COMPLIANCE ENGINE
------------------------------------------ */
export function runPageCompliance(
  content: string
): PageComplianceResult {
  const reasons: string[] = [];

  const lower = content.toLowerCase();

  /* ---- HARD BLOCKS ---- */
  const illegalPatterns = [
    "child sexual",
    "terrorist",
    "bomb making",
    "drug manufacturing",
  ];

  if (illegalPatterns.some(p => lower.includes(p))) {
    return {
      level: "BLOCK",
      reasons: ["ILLEGAL_CONTENT"],
    };
  }

  /* ---- PORNOGRAPHIC ---- */
  const pornPatterns = [
    "explicit sex",
    "porn",
    "xxx",
    "hardcore",
  ];

  if (pornPatterns.some(p => lower.includes(p))) {
    return {
      level: "BLOCK",
      reasons: ["PORNOGRAPHIC_CONTENT"],
    };
  }

  /* ---- WARNINGS ---- */
  const warningPatterns = [
    "gambling",
    "betting",
    "crypto",
    "adult",
  ];

  if (warningPatterns.some(p => lower.includes(p))) {
    reasons.push("SENSITIVE_CONTENT");
  }

  return {
    level: reasons.length ? "WARN" : "PASS",
    reasons,
  };
}
