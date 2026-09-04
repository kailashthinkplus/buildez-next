import { createGoldenDesignInput, type GoldenDesignFixture } from "./fixtureFactory";

export const luxuryRealEstateDesignFixture: GoldenDesignFixture = Object.freeze({
  id: "design.luxury-real-estate", input: createGoldenDesignInput("real_estate", "Luxury", "airy", "luxury"),
  expected: Object.freeze({ visualDirection: "luxury-editorial", typography: "editorial", density: "airy", media: "cinematic", minimumScore: 85 }),
});
