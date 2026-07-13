/**
 * Resolves the rendered browser-pixel edge band used for native DnD
 * before/after intent detection.
 *
 * Normal targets retain the established 12–28px interaction zone.
 * Short targets, including elements rendered at reduced canvas zoom,
 * are capped below half their rendered span so before and after zones
 * can never overlap.
 */
export function resolveNonOverlappingDropEdge(
  span: number,
): number {
  if (!Number.isFinite(span) || span <= 0) {
    return 0;
  }

  const preferredEdge = Math.max(
    12,
    Math.min(28, span * 0.2),
  );

  const maximumNonOverlappingEdge = Math.max(
    0,
    span / 2 - 1,
  );

  return Math.min(
    preferredEdge,
    maximumNonOverlappingEdge,
  );
}
