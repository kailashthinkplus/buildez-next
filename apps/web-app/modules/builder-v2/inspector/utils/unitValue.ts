export const INSPECTOR_UNITS = ["px", "%", "em", "rem", "vw", "vh"] as const;

export type InspectorUnit = (typeof INSPECTOR_UNITS)[number];

export type ParsedUnitValue = Readonly<{
  value: number;
  unit: InspectorUnit;
}>;

const UNIT_PATTERN = /^(-?\d+(?:\.\d+)?)(px|%|em|rem|vw|vh)?$/;

export function parseUnitValue(
  value: unknown,
  fallbackUnit: InspectorUnit = "px"
): ParsedUnitValue {
  if (typeof value === "number" && Number.isFinite(value)) {
    return { value, unit: fallbackUnit };
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    const match = trimmed.match(UNIT_PATTERN);

    if (match) {
      return {
        value: Number(match[1]),
        unit: normalizeInspectorUnit(match[2], fallbackUnit),
      };
    }
  }

  return { value: 0, unit: fallbackUnit };
}

export function formatUnitValue(value: number, unit: InspectorUnit): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${safeValue}${unit}`;
}

export function normalizeInspectorUnit(
  unit: unknown,
  fallback: InspectorUnit = "px"
): InspectorUnit {
  return INSPECTOR_UNITS.includes(unit as InspectorUnit) ? (unit as InspectorUnit) : fallback;
}

export function clampUnitValue(value: number, min?: number, max?: number): number {
  if (!Number.isFinite(value)) return min ?? 0;
  if (typeof min === "number" && value < min) return min;
  if (typeof max === "number" && value > max) return max;
  return value;
}
