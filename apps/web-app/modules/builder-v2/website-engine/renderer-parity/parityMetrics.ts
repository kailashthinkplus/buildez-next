import type { RendererParitySnapshot } from "./paritySnapshot";
import type { RendererParityIssue } from "./rendererParity";
import type { RenderTargetDescriptor } from "./renderTargets";

export type RendererParityMetrics = Readonly<{
  targetCount: number;
  snapshotCount: number;
  issueCount: number;
  blockerCount: number;
  warningCount: number;
  unsupportedWidgetTypeCount: number;
  missingAssetCount: number;
  screenshotCaptured: false;
  renderSideEffects: false;
}>;

/**
 * Collects metadata-only parity metrics.
 *
 * @example
 * const metrics = collectRendererParityMetrics(targets, snapshots, issues, 0);
 */
export function collectRendererParityMetrics(
  targets: RenderTargetDescriptor[],
  snapshots: RendererParitySnapshot[],
  issues: RendererParityIssue[],
  warningCount: number
): RendererParityMetrics {
  return Object.freeze({
    targetCount: targets.length,
    snapshotCount: snapshots.length,
    issueCount: issues.length,
    blockerCount: issues.filter((issue) => issue.severity === "blocker").length,
    warningCount,
    unsupportedWidgetTypeCount: snapshots.reduce((total, snapshot) => total + snapshot.unsupportedWidgetTypes.length, 0),
    missingAssetCount: Math.max(0, ...snapshots.map((snapshot) => snapshot.missingAssetCount)),
    screenshotCaptured: false as const,
    renderSideEffects: false as const,
  });
}
