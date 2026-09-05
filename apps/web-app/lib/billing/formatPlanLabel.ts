/**
 * Turns an internal plan code like "PROFESSIONAL_2026" or "FREE" into a
 * short, human-readable label for the rare UI spots that show the code
 * itself (a slide-style index label, a technical eyebrow) rather than the
 * plan's own `name`/`eyebrow` fields.
 */
export function formatPlanCodeLabel(code: string): string {
  const withoutCatalogYear = code.replace(/_\d{4}$/, "");
  return withoutCatalogYear
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
