export const PLAN_FEATURES = {
  FREE: {
    maxSites: 1,
    maxPages: 5,
    aiCredits: 20,
    teamMembers: 1,
    publish: false,
  },
  PRO: {
    maxSites: 5,
    maxPages: 100,
    aiCredits: 500,
    teamMembers: 5,
    publish: true,
  },
  BUSINESS: {
    maxSites: 20,
    maxPages: 1000,
    aiCredits: 5000,
    teamMembers: 20,
    publish: true,
  },
} as const;

export type PlanCode = keyof typeof PLAN_FEATURES;
export type PlanFeatures = (typeof PLAN_FEATURES)[PlanCode];
