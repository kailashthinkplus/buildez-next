export declare function getTenantUsage(tenantId: string): Promise<{
    sites: any;
    pages: number;
    aiCreditsUsed: number;
}>;
