import { createGoldenWebsiteCase } from "./fixtureFactory";
export const ecommerceGoldenCases = Object.freeze(["fashion-brand", "luxury-brand", "electronics-brand", "d2c-product"].map((id) => createGoldenWebsiteCase(id, "ecommerce_d2c")));
