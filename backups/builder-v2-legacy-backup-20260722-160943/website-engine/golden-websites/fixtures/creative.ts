import { createGoldenWebsiteCase } from "./fixtureFactory";
export const creativeGoldenCases = Object.freeze(["photographer", "design-agency", "video-production"].map((id) => createGoldenWebsiteCase(id, "creative_portfolio")));
