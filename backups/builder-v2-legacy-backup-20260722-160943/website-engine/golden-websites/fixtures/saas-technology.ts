import { createGoldenWebsiteCase } from "./fixtureFactory";
export const saasTechnologyGoldenCases = Object.freeze(["saas-product", "ai-startup", "developer-tool", "cybersecurity"].map((id) => createGoldenWebsiteCase(id, "technology_saas")));
