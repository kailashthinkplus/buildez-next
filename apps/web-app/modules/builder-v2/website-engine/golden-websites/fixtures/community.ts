import { createGoldenWebsiteCase } from "./fixtureFactory";
export const communityGoldenCases = Object.freeze(["ngo", "foundation", "community-organization"].map((id) => createGoldenWebsiteCase(id, "ngo_community")));
