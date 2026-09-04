import { createGoldenDesignInput, type GoldenDesignFixture } from "./fixtureFactory";

export const automotiveDesignFixture: GoldenDesignFixture = Object.freeze({
  id: "design.automotive", input: createGoldenDesignInput("automotive", "Bold", "balanced"),
  expected: Object.freeze({ visualDirection: "performance-premium", typography: "balanced", density: "balanced", media: "performance", minimumScore: 85 }),
});
