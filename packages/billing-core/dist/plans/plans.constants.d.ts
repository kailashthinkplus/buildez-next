export declare const PLAN_FEATURES: {
    readonly FREE: {
        readonly maxSites: 1;
        readonly maxPages: 5;
        readonly aiCredits: 20;
        readonly teamMembers: 1;
        readonly publish: false;
    };
    readonly PRO: {
        readonly maxSites: 5;
        readonly maxPages: 100;
        readonly aiCredits: 500;
        readonly teamMembers: 5;
        readonly publish: true;
    };
    readonly BUSINESS: {
        readonly maxSites: 20;
        readonly maxPages: 1000;
        readonly aiCredits: 5000;
        readonly teamMembers: 20;
        readonly publish: true;
    };
};
export type PlanCode = keyof typeof PLAN_FEATURES;
export type PlanFeatures = (typeof PLAN_FEATURES)[PlanCode];
