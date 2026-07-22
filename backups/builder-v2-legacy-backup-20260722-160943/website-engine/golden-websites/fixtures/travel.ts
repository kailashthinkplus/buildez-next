import { createGoldenWebsiteCase } from "./fixtureFactory";
export const travelGoldenCases = Object.freeze(["travel-agency", "tour-operator", "adventure-company"].map((id) => createGoldenWebsiteCase(id, "travel")));
