export type DesignFamilyProfile = Readonly<{
  direction: string;
  typography: "luxury" | "readable" | "editorial" | "dense-ui" | "bold";
  density: "compact" | "balanced" | "airy";
  media: "cinematic" | "editorial-lifestyle" | "trustworthy-clean" | "performance" | "ui-product";
}>;

const FAMILY_PROFILES: Readonly<Record<string, DesignFamilyProfile>> = Object.freeze({
  real_estate: Object.freeze({ direction: "luxury-editorial", typography: "luxury", density: "airy", media: "cinematic" }),
  healthcare: Object.freeze({ direction: "clear-clinical", typography: "readable", density: "balanced", media: "trustworthy-clean" }),
  food_and_beverage: Object.freeze({ direction: "hospitality-editorial", typography: "editorial", density: "airy", media: "editorial-lifestyle" }),
  restaurant: Object.freeze({ direction: "hospitality-editorial", typography: "editorial", density: "airy", media: "editorial-lifestyle" }),
  technology_saas: Object.freeze({ direction: "product-precision", typography: "dense-ui", density: "compact", media: "ui-product" }),
  saas: Object.freeze({ direction: "product-precision", typography: "dense-ui", density: "compact", media: "ui-product" }),
  automotive: Object.freeze({ direction: "performance-premium", typography: "bold", density: "balanced", media: "performance" }),
});

const DEFAULT_PROFILE: DesignFamilyProfile = Object.freeze({ direction: "modern-balanced", typography: "readable", density: "balanced", media: "trustworthy-clean" });

export function normalizeDesignFamily(family?: string): string {
  return (family ?? "unknown").toLowerCase().replace(/[\s-]+/g, "_");
}

export function designProfileFor(family?: string): DesignFamilyProfile {
  return FAMILY_PROFILES[normalizeDesignFamily(family)] ?? DEFAULT_PROFILE;
}
