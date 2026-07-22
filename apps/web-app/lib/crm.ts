import { createHash, randomBytes } from "crypto";

export const CRM_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"] as const;

export function cleanLead(input: Record<string, unknown>) {
  const text = (key: string, max = 500) => typeof input[key] === "string" ? String(input[key]).trim().slice(0, max) || null : null;
  const email = text("email", 254)?.toLowerCase() || null;
  const name = text("name", 160) || email?.split("@")[0] || "Website lead";
  const status = String(input.status || "NEW").toUpperCase();
  return {
    name, email, phone: text("phone", 50), company: text("company", 160),
    message: text("message", 5000), source: text("source", 100) || "website",
    sourceUrl: text("sourceUrl", 1000), status: CRM_STATUSES.some(value => value === status) ? status : "NEW",
    tags: Array.isArray(input.tags) ? input.tags.filter((x): x is string => typeof x === "string").slice(0, 20) : [],
    notes: text("notes", 5000), consent: input.consent === true,
    customData: input.customData && typeof input.customData === "object" ? input.customData as object : undefined,
  };
}

export function leadScore(lead: ReturnType<typeof cleanLead>) {
  return Math.min(100, (lead.email ? 25 : 0) + (lead.phone ? 25 : 0) + (lead.company ? 15 : 0) + (lead.message ? 20 : 0) + (lead.consent ? 10 : 0) + (lead.source !== "manual" ? 5 : 0));
}

export function newApiKey() {
  const raw = `bez_crm_${randomBytes(24).toString("base64url")}`;
  return { raw, prefix: raw.slice(0, 15), hash: hashApiKey(raw) };
}
export const hashApiKey = (key: string) => createHash("sha256").update(key).digest("hex");
