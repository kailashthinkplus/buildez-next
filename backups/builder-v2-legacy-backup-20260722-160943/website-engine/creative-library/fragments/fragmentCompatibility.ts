import type { FragmentInput, CreativeFragment } from "./creativeFragment";

function overlaps(left: readonly string[] = [], right: readonly string[] = []) {
  return !left.length || !right.length || left.some((value) => right.includes(value));
}

export function isFragmentCompatible(fragment: CreativeFragment, input: FragmentInput = {}) {
  return Boolean(
    (!input.baseRecipe || fragment.compatibility.supportedRecipeFamilies.includes(input.baseRecipe.family)) &&
    overlaps(input.industries, fragment.compatibility.supportedIndustries) &&
    overlaps(input.designLanguages, fragment.compatibility.supportedDesignLanguages)
  );
}
