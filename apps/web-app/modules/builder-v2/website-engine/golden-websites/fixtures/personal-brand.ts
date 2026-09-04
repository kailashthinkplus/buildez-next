import { createGoldenWebsiteCase } from "./fixtureFactory";
export const personalBrandGoldenCases = Object.freeze(["speaker", "author", "creator"].map((id) => createGoldenWebsiteCase(id, "personal_brand")));
