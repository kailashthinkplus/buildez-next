import { createGoldenDesignInput, type GoldenDesignFixture } from "./fixtureFactory";

export const restaurantDesignFixture: GoldenDesignFixture = Object.freeze({
  id: "design.restaurant", input: createGoldenDesignInput("food_and_beverage", "Hospitality", "airy"),
  expected: Object.freeze({ visualDirection: "hospitality-editorial", typography: "editorial", density: "airy", media: "editorial-lifestyle", minimumScore: 85 }),
});
