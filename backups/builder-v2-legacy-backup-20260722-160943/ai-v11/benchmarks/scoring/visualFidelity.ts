export type VisualEvidence = Readonly<{
  pixelDifferenceRatio: number;
  sectionOrderCorrect: boolean;
  headingDelta: number;
  ctaDelta: number;
  heroMediaDelta: number;
  floatingCardDelta: number;
  editorialImageDelta: number;
  headingFontSizeDelta: number;
  gridCompositionCorrect: boolean;
  overlapCorrect: boolean;
  overlapExpected?: boolean;
  responsiveStackingCorrect: boolean;
  backgroundPresent: boolean;
  imageCropCorrect: boolean;
  residualEffectsPresent: boolean;
  contentComplete: boolean;
  editable: boolean;
  canvasRuntimeParity: boolean;
  horizontalOverflow: boolean;
  productionRendererUsed: boolean;
  compilerOutputUsed: boolean;
  heroMediaRolePresent: boolean;
}>;

export type VisualFidelityReport = Readonly<{
  categories: Readonly<Record<string, number>>;
  criticalFailures: readonly string[];
  passed: boolean;
  evidence: VisualEvidence;
}>;

const scoreDelta = (delta: number, tolerance: number) =>
  Math.max(0, Math.round(100 * (1 - Math.min(1, delta / tolerance))));
const floor = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function scoreVisualFidelity(
  evidence: VisualEvidence,
): VisualFidelityReport {
  const pixelScore = floor((1 - evidence.pixelDifferenceRatio) * 100);
  const categories = Object.freeze({
    composition: evidence.sectionOrderCorrect
      ? Math.min(100, pixelScore + 10)
      : 0,
    geometry: floor(
      (scoreDelta(evidence.headingDelta, 1.2) +
        scoreDelta(evidence.ctaDelta, 1.2)) /
        2,
    ),
    responsiveComposition:
      evidence.responsiveStackingCorrect && !evidence.horizontalOverflow
        ? 100
        : 0,
    typography: scoreDelta(evidence.headingFontSizeDelta, 0.35),
    backgroundsAndColor: evidence.backgroundPresent ? pixelScore : 0,
    imagePlacementAndCrop: evidence.imageCropCorrect
      ? Math.min(scoreDelta(evidence.heroMediaDelta, 0.5), 100)
      : 0,
    overlapAndLayering: evidence.overlapExpected === false
      ? 100
      : evidence.overlapCorrect
      ? scoreDelta(
          Math.min(evidence.floatingCardDelta, evidence.editorialImageDelta),
          0.65,
        )
      : 0,
    residualEffects: evidence.residualEffectsPresent ? 100 : 0,
    contentCompleteness: evidence.contentComplete ? 100 : 0,
    editability: evidence.editable ? 100 : 0,
    canvasRuntimeParity: evidence.canvasRuntimeParity ? 100 : 0,
  });
  const criticalFailures: string[] = [];
  if (!evidence.sectionOrderCorrect)
    criticalFailures.push("missing-or-reordered-section");
  if (evidence.headingDelta >= 0.8)
    criticalFailures.push("primary-heading-region-mismatch");
  if (evidence.ctaDelta >= 0.8)
    criticalFailures.push("missing-or-misplaced-cta");
  if (!evidence.gridCompositionCorrect)
    criticalFailures.push("asymmetric-grid-flattened");
  if (evidence.overlapExpected !== false && !evidence.overlapCorrect)
    criticalFailures.push("intentional-overlap-removed");
  if (!evidence.responsiveStackingCorrect)
    criticalFailures.push("incorrect-responsive-stacking");
  if (evidence.horizontalOverflow) criticalFailures.push("horizontal-overflow");
  if (!evidence.heroMediaRolePresent)
    criticalFailures.push("missing-hero-media-role");
  if (!evidence.imageCropCorrect) criticalFailures.push("image-crop-mismatch");
  if (!evidence.residualEffectsPresent)
    criticalFailures.push("required-residual-effect-absent");
  if (!evidence.canvasRuntimeParity)
    criticalFailures.push("canvas-runtime-mismatch");
  if (!evidence.productionRendererUsed)
    criticalFailures.push("non-production-renderer");
  if (!evidence.compilerOutputUsed)
    criticalFailures.push("hand-authored-blueprint");
  const passed =
    criticalFailures.length === 0 &&
    Object.values(categories).every((value) => value >= 55);
  return Object.freeze({
    categories,
    criticalFailures: Object.freeze(criticalFailures),
    passed,
    evidence,
  });
}
