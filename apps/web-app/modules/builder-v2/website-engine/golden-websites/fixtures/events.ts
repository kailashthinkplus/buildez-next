import { createGoldenWebsiteCase } from "./fixtureFactory";
export const eventsGoldenCases = Object.freeze(["event-management", "conference", "wedding-planner"].map((id) => createGoldenWebsiteCase(id, "entertainment_events")));
