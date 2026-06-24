export type ComplianceResult = {
    allowed: boolean;
    level: "PASS" | "WARN" | "BLOCK";
    reasons?: string[];
};
export type SiteSnapshot = {
    name: string;
    slug: string;
    pages: {
        title: string;
        content: string;
    }[];
};
