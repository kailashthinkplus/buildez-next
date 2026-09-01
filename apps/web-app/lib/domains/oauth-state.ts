import crypto from "node:crypto";

const secret = () => process.env.AUTH_SECRET || process.env.DOMAIN_INTEGRATION_SECRET || "";

export function encodeDomainState(value: Record<string, string>) {
  if (!secret()) throw new Error("AUTH_SECRET is required for domain connections");
  const payload = Buffer.from(JSON.stringify(value)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function decodeDomainState(value: string) {
  const [payload, signature] = value.split(".");
  if (!payload || !signature || !secret()) return null;
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, string>; }
  catch { return null; }
}
