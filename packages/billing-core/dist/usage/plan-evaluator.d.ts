import { PlanCode } from "../plans/plans.constants";
type Usage = {
    sites: number;
    pages: number;
    aiCreditsUsed: number;
};
export declare function evaluatePlanUsage(plan: PlanCode, usage: Usage): {
    plan: "FREE" | "PRO" | "BUSINESS";
    usage: Usage;
    limits: {
        readonly maxSites: 1;
        readonly maxPages: 5;
        readonly aiCredits: 20;
        readonly teamMembers: 1;
        readonly publish: false;
    } | {
        readonly maxSites: 5;
        readonly maxPages: 100;
        readonly aiCredits: 500;
        readonly teamMembers: 5;
        readonly publish: true;
    } | {
        readonly maxSites: 20;
        readonly maxPages: 1000;
        readonly aiCredits: 5000;
        readonly teamMembers: 20;
        readonly publish: true;
    };
    flags: {
        siteLimitReached: boolean;
        canCreateSite: boolean;
        canPublish: boolean;
        upgradeRequired: boolean;
    };
};
export {};
