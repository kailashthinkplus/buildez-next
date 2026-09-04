import { createGoldenWebsiteCase } from "./fixtureFactory";
export const financeGoldenCases = Object.freeze(["fintech", "insurance", "investment-advisor"].map((id) => createGoldenWebsiteCase(id, "legal_finance")));
