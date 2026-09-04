import { createGoldenWebsiteCase } from "./fixtureFactory";
export const automotiveGoldenCases = Object.freeze(["luxury-dealership", "used-car-marketplace", "automotive-service-center"].map((id) => createGoldenWebsiteCase(id, "automotive")));
