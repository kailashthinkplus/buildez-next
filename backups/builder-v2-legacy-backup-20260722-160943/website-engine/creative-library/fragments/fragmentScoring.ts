import type { CreativeFragment, CreativeFragmentCandidate, CreativeFragmentScore, FragmentInput } from "./creativeFragment";
import { isFragmentCompatible } from "./fragmentCompatibility";

function scoreList(inputValues: readonly string[] | undefined, values: readonly string[]) {
  if (!inputValues?.length) return 0.74;
  return Math.min(1, inputValues.filter((value) => values.includes(value)).length / Math.max(1, inputValues.length));
}

export function scoreCreativeFragment(fragment: CreativeFragment, input: FragmentInput = {}): CreativeFragmentScore {
  const familyFit = input.baseRecipe ? (fragment.compatibility.supportedRecipeFamilies.includes(input.baseRecipe.family) ? 1 : 0.25) : 0.75;
  const designFit = scoreList(input.designLanguages, fragment.compatibility.supportedDesignLanguages);
  const industryFit = scoreList(input.industries, fragment.compatibility.supportedIndustries);
  const dnaFit = input.designDna ? scoreList(input.designDna.traits.map((trait) => trait.axis), fragment.compatibility.dnaAxes) : 0.72;
  const overall = Number(((familyFit + designFit + industryFit + dnaFit) / 4).toFixed(3));
  return Object.freeze({ familyFit, designFit, industryFit, dnaFit, overall });
}

export function buildFragmentCandidates(fragments: readonly CreativeFragment[], input: FragmentInput = {}): CreativeFragmentCandidate[] {
  return fragments
    .filter((fragment) => isFragmentCompatible(fragment, input))
    .map((fragment) => Object.freeze({ fragment, score: scoreCreativeFragment(fragment, input), reasons: [`Matched ${fragment.family} fragment.`], risks: fragment.conflicts }));
}

export const scoreCreativeFragments = buildFragmentCandidates;
