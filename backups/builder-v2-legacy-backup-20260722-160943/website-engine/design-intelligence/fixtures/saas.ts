import { createGoldenDesignInput, type GoldenDesignFixture } from "./fixtureFactory";

export const saasDesignFixture: GoldenDesignFixture = Object.freeze({
  id: "design.saas", input: createGoldenDesignInput("technology_saas", "Technology", "compact"),
  expected: Object.freeze({ visualDirection: "product-precision", typography: "compact", density: "compact", media: "ui-product", minimumScore: 85 }),
});
