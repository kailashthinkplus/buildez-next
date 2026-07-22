import type { MapNeed, MediaFamilyContext, MediaInput } from "./mediaStrategy";

function map(id: string, label: string, purpose: string, required = true): MapNeed {
  return Object.freeze({ id, label, purpose, truthLevel: "must_be_real", required, notes: ["Use verified address/location data only."] });
}

/**
 * Infers map needs.
 *
 * @example
 * const maps = inferMapNeeds(input, context);
 */
export function inferMapNeeds(input: MediaInput, context: MediaFamilyContext): MapNeed[] {
  void input;
  if (["real_estate", "healthcare", "food_and_beverage", "education", "hospitality", "automotive"].includes(context.family)) {
    return [map("map.location", "Location map", "Location confidence")];
  }
  return [];
}
