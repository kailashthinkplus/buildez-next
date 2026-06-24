export type RuntimeType = "NGINX" | "EDGE";

export interface RuntimeAdapter {
  attachCertificate(domain: string): Promise<void>;
  detachCertificate(domain: string): Promise<void>;
  attachRender(siteId: string, version: number): Promise<void>;
}
