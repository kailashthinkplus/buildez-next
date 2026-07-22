import { createGoldenWebsiteCase } from "./fixtureFactory";
export const professionalServicesGoldenCases = Object.freeze(["law-firm", "consulting", "accounting", "architecture-studio"].map((id) => createGoldenWebsiteCase(id, id === "law-firm" ? "legal_finance" : "professional_services")));
