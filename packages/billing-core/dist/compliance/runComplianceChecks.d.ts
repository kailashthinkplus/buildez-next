import { ComplianceResult } from "./types";
export declare function runComplianceChecks(input: {
    html: string;
    js?: string;
    css?: string;
}): Promise<ComplianceResult>;
