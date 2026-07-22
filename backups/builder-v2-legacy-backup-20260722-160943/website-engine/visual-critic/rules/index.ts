import { conversionRules } from "./conversionRules";
import { layoutRules } from "./layoutRules";
import { mediaRules } from "./mediaRules";
import { responsiveRules } from "./responsiveRules";
import { typographyRules } from "./typographyRules";

export const VISUAL_CRITIC_RULES = Object.freeze([...layoutRules, ...typographyRules, ...conversionRules, ...mediaRules, ...responsiveRules]);

export * from "./conversionRules";
export * from "./layoutRules";
export * from "./mediaRules";
export * from "./responsiveRules";
export * from "./typographyRules";
