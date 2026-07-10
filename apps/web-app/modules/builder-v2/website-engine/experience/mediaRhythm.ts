import type { ExperienceFamilyContext, ExperienceInput, MediaRhythm } from "./experienceStrategy";

const mediaByFamily: Record<string, MediaRhythm> = {
  healthcare: ["calm contextual media if provided", "avoid overwhelming medical imagery", "proof media only if supplied"],
  real_estate: ["hero/gallery media early", "location visual break", "amenity/project detail media if provided"],
  food_and_beverage: ["sensory food/ambience media early", "menu visual support", "locality/action media break"],
  automotive: ["vehicle/service media early", "inventory/service visual scan", "proof or workshop media if provided"],
  education: ["campus/program media early", "program visual support", "faculty/outcome proof only if provided"],
  ecommerce_d2c: ["product media immediately", "detail media rhythm", "proof/review media only if provided"],
  hospitality: ["destination/stay media early", "amenity media rhythm", "location/booking confidence media"],
  architecture_interiors: ["portfolio media immediately", "process/detail visual rhythm", "proof media only if provided"],
  unknown: ["media only when assets are provided", "avoid placeholder visuals"],
};

/**
 * Infers media rhythm without selecting assets.
 *
 * @example
 * const media = inferMediaRhythm(input, familyContext);
 */
export function inferMediaRhythm(_input: ExperienceInput, familyContext: ExperienceFamilyContext): MediaRhythm {
  return mediaByFamily[familyContext.family] ?? mediaByFamily.unknown;
}
