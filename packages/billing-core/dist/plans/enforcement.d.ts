import { PlanCode } from "./plans.constants";
export type PlanUsage = {
    sitesUsed: number;
    pagesUsed: number;
    aiCreditsUsed?: number;
};
export type EnforcementResult = {
    allowed: boolean;
    reason?: string;
    limit?: number;
};
export declare function canCreateSite(plan: PlanCode, usage: PlanUsage): EnforcementResult;
export declare function canCreatePage(plan: PlanCode, usage: PlanUsage): EnforcementResult;
export declare function canConsumeAiCredits(plan: PlanCode, usedCredits: number, requestedCredits: number): EnforcementResult;
export declare function canPublishSite(plan: PlanCode): EnforcementResult;
export declare function assertCanCreateSite(plan: PlanCode, usage: PlanUsage): void;
