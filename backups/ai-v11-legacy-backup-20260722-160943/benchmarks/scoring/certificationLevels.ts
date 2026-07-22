import type { VisualFidelityReport } from "./visualFidelity";

export type CertificationLevels = Readonly<{
  architectureProof: boolean;
  acceptableFidelity: boolean;
  productionGradeFidelity: boolean;
  controllingCategory: string;
  minimumScore: number;
}>;
const minimum = (report: VisualFidelityReport) =>
  Object.entries(report.categories).sort((a, b) => a[1] - b[1])[0] ??
  (["none", 0] as const);
export function certifyVisualLevels(
  report: VisualFidelityReport,
  unresolvedVisibleIntent = 0,
): CertificationLevels {
  const [controllingCategory, minimumScore] = minimum(report);
  const c = report.categories;
  const architectureProof =
    report.criticalFailures.length === 0 && minimumScore >= 50;
  const acceptableFidelity =
    report.criticalFailures.length === 0 &&
    minimumScore >= 75 &&
    (c.geometry ?? 0) >= 75 &&
    (c.responsiveComposition ?? 0) >= 80 &&
    (c.typography ?? 0) >= 80 &&
    (c.imagePlacementAndCrop ?? 0) >= 80;
  const productionGradeFidelity =
    report.criticalFailures.length === 0 &&
    unresolvedVisibleIntent === 0 &&
    minimumScore >= 85 &&
    (c.composition ?? 0) >= 90 &&
    (c.geometry ?? 0) >= 85 &&
    (c.responsiveComposition ?? 0) >= 90 &&
    (c.typography ?? 0) >= 85 &&
    (c.imagePlacementAndCrop ?? 0) >= 85 &&
    (c.overlapAndLayering ?? 0) >= 90;
  return Object.freeze({
    architectureProof,
    acceptableFidelity,
    productionGradeFidelity,
    controllingCategory,
    minimumScore,
  });
}
