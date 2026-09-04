import dns from "node:dns/promises";

import { DOMAIN_SERVER_IP } from "@/lib/domain-provisioning";

const RESOLVERS = [
  { name: "Cloudflare", addresses: ["1.1.1.1", "1.0.0.1"] },
  { name: "Google", addresses: ["8.8.8.8", "8.8.4.4"] },
] as const;

async function inspectWithResolver(domain: string, token: string, addresses?: readonly string[]) {
  const resolver = new dns.Resolver();
  if (addresses) resolver.setServers([...addresses]);
  const verificationHost = `_buildez-verification.${domain}`;
  const [a, txt] = await Promise.all([
    resolver.resolve4(domain).catch(() => [] as string[]),
    resolver.resolveTxt(verificationHost).catch(() => [] as string[][]),
  ]);
  return {
    routed: a.includes(DOMAIN_SERVER_IP),
    ownership: txt.flat().some((value) => value === token),
    addresses: a,
  };
}

export async function checkDomainPropagation(domain: string, token: string) {
  const checks = await Promise.all([
    inspectWithResolver(domain, token).then((result) => ({ resolver: "Local", ...result })),
    ...RESOLVERS.map((resolver) => inspectWithResolver(domain, token, resolver.addresses).then((result) => ({ resolver: resolver.name, ...result }))),
  ]);
  return evaluateDomainPropagation(checks);
}

export type DomainPropagationCheck = {
  resolver: string;
  routed: boolean;
  ownership: boolean;
  addresses: string[];
};

export function evaluateDomainPropagation(checks: DomainPropagationCheck[]) {
  const readyResolvers = checks.filter((check) => check.routed && check.ownership).length;
  return { ready: readyResolvers >= 2, readyResolvers, totalResolvers: checks.length, checks };
}

export type DetectedDnsProvider = "CLOUDFLARE" | "GODADDY" | "OTHER" | "UNKNOWN";

/**
 * Identifies the DNS provider from the domain's own nameservers, so the UI
 * can surface a "Connect with Cloudflare/GoDaddy" action (or fall back to
 * generic manual steps) without asking the user which registrar they use.
 */
export async function detectDnsProvider(domain: string): Promise<DetectedDnsProvider> {
  try {
    const nameservers = await dns.resolveNs(domain);
    const lower = nameservers.map((ns) => ns.toLowerCase());
    if (lower.some((ns) => ns.endsWith(".cloudflare.com"))) return "CLOUDFLARE";
    if (lower.some((ns) => ns.endsWith(".domaincontrol.com"))) return "GODADDY";
    return nameservers.length ? "OTHER" : "UNKNOWN";
  } catch {
    return "UNKNOWN";
  }
}
