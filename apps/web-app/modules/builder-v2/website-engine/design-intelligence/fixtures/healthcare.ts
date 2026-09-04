import { createGoldenDesignInput, type GoldenDesignFixture } from "./fixtureFactory";

export const healthcareDesignFixture: GoldenDesignFixture = Object.freeze({
  id: "design.healthcare", input: createGoldenDesignInput("healthcare", "Clinical", "balanced"),
  expected: Object.freeze({ visualDirection: "clear-clinical", typography: "balanced", density: "balanced", media: "trustworthy-clean", minimumScore: 85 }),
});
