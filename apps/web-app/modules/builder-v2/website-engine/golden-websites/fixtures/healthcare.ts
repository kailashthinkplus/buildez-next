import { createGoldenWebsiteCase } from "./fixtureFactory";
export const healthcareGoldenCases = Object.freeze(["hospital", "doctor-practice", "dental-clinic", "diagnostic-center"].map((id) => createGoldenWebsiteCase(id, "healthcare")));
