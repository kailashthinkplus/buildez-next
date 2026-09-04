import geoip from "geoip-lite";

/**
 * EU + EEA (GDPR) plus the UK (retained UK GDPR). Switzerland (CH) is
 * intentionally excluded — it has its own FADP regime, not GDPR.
 */
const EEA_UK_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", // EU-27
  "IS", "LI", "NO", // EEA
  "GB", // UK GDPR
]);

export type ConsentRegion = "eu" | "us" | "other";

function isPrivateOrLocalIp(ip: string): boolean {
  return (
    !ip ||
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
}

export function firstForwardedIp(forwardedFor: string | null | undefined, realIp?: string | null): string {
  const fromForwardedHeader = forwardedFor?.split(",")[0]?.trim();
  return fromForwardedHeader || realIp?.trim() || "";
}

/** Resolves the consent regime for a visitor IP using an offline GeoLite2-derived lookup — no external API calls. */
export function resolveConsentRegion(ip: string | null | undefined): ConsentRegion {
  if (!ip || isPrivateOrLocalIp(ip)) return "other";
  const geo = geoip.lookup(ip);
  const country = geo?.country;
  if (!country) return "other";
  if (country === "US") return "us";
  if (EEA_UK_COUNTRIES.has(country)) return "eu";
  return "other";
}

export function regionRequiresConsentNotice(region: ConsentRegion): boolean {
  return region === "eu" || region === "us";
}
