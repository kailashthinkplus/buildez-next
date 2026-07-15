import { automotiveCompositionFixture } from "./fixtures/automotive";
import { healthcareCompositionFixture } from "./fixtures/healthcare";
import { luxuryRealEstateCompositionFixture } from "./fixtures/luxury-real-estate";
import { professionalServicesCompositionFixture } from "./fixtures/professional-services";
import { restaurantCompositionFixture } from "./fixtures/restaurant";

export type CompositionQualityFixture = Readonly<{
  id: string;
  businessFamily: string;
  archetype: string;
  conversionGoal: string;
  sections: readonly Readonly<{ id: string; componentVariantId: string; category: string; purpose: string }>[];
  expectedMinimumScore: number;
}>;

export const COMPOSITION_QUALITY_FIXTURES: readonly CompositionQualityFixture[] = Object.freeze([
  luxuryRealEstateCompositionFixture,
  automotiveCompositionFixture,
  restaurantCompositionFixture,
  healthcareCompositionFixture,
  professionalServicesCompositionFixture,
]);
