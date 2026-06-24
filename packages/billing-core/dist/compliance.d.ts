export type ComplianceResult = {
    allowed: boolean;
    level?: "WARN" | "BLOCK";
    reasons?: string[];
};
/**
 * MVP compliance engine
 * (future: AI / policy / moderation)
 */
export declare function runComplianceChecks(input: {
    name: string;
    slug: string;
    pages: Array<{
        title: string;
        content: string | null;
    }>;
}): Promise<ComplianceResult>;
