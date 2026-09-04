export type LayoutFeasibilityInput = Readonly<{
  estimatedContainerWidth: number;
  outerTrackAllocation: readonly number[];
  outerTrackIndex: number;
  outerGap: number;
  innerGap: number;
  childCount: number;
  childPadding: number;
  declaredMinimumCardWidth: number;
  declaredMinimumTextContentWidth: number;
}>;

export type LayoutFeasibilityResult = Readonly<{
  feasible: boolean;
  effectiveTrackWidth: number;
  effectiveCardWidth: number;
  effectiveContentWidth: number;
  selectedTrackCount: number;
  fallbackReason?: string;
}>;

const rounded = (value: number) => Number(Math.max(0, value).toFixed(2));

/** Deterministically validates nested archetype tracks before Blueprint emission. */
export function evaluateLayoutFeasibility(input: LayoutFeasibilityInput): LayoutFeasibilityResult {
  const allocationTotal = input.outerTrackAllocation.reduce((sum, value) => sum + Math.max(0, value), 0) || 1;
  const outerAvailable = Math.max(0, input.estimatedContainerWidth - Math.max(0, input.outerTrackAllocation.length - 1) * input.outerGap);
  const effectiveTrackWidth = outerAvailable * (input.outerTrackAllocation[input.outerTrackIndex] ?? 0) / allocationTotal;
  const requested = Math.max(1, Math.floor(input.childCount));
  let selectedTrackCount = 1;
  let effectiveCardWidth = effectiveTrackWidth;
  let effectiveContentWidth = Math.max(0, effectiveCardWidth - input.childPadding * 2);
  for (let tracks = requested; tracks >= 1; tracks -= 1) {
    const cardWidth = (effectiveTrackWidth - Math.max(0, tracks - 1) * input.innerGap) / tracks;
    const contentWidth = cardWidth - input.childPadding * 2;
    if (cardWidth >= input.declaredMinimumCardWidth && contentWidth >= input.declaredMinimumTextContentWidth) {
      selectedTrackCount = tracks;
      effectiveCardWidth = cardWidth;
      effectiveContentWidth = contentWidth;
      break;
    }
  }
  const requestedFeasible = selectedTrackCount === requested;
  return Object.freeze({
    feasible: requestedFeasible,
    effectiveTrackWidth: rounded(effectiveTrackWidth),
    effectiveCardWidth: rounded(effectiveCardWidth),
    effectiveContentWidth: rounded(effectiveContentWidth),
    selectedTrackCount,
    fallbackReason: requestedFeasible ? undefined : `${requested} tracks yield content below ${input.declaredMinimumTextContentWidth}px; selected ${selectedTrackCount}.`,
  });
}
