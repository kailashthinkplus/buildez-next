import { createGoldenWebsiteCase } from "./fixtureFactory";
export const educationGoldenCases = Object.freeze(["university", "coaching-institute", "online-course", "edtech-platform"].map((id) => createGoldenWebsiteCase(id, "education")));
