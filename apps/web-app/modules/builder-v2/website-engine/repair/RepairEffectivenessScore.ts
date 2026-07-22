export type RepairEffectivenessScore = Readonly<{ before: number; after: number; improvement: number; confidence: number; accepted: boolean }>;

export function calculateRepairEffectiveness(before: number, after: number, confidence: number): RepairEffectivenessScore {
  const improvement = Math.round((after - before) * 100) / 100;
  return Object.freeze({ before, after, improvement, confidence, accepted: improvement >= 0 });
}
