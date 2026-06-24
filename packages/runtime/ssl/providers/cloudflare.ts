/**
 * BuildEZ – Cloudflare DNS Adapter
 * --------------------------------
 * Used for ACME DNS-01 challenges
 *
 * Requirements:
 * - Cloudflare API Token (DNS Edit permission)
 * - Zone must already exist in Cloudflare
 */

import fetch from "node-fetch";

/* ----------------------------------------
   ENV REQUIRED
---------------------------------------- */

/**
 * Cloudflare API Token
 * Permissions:
 * - Zone:Read
 * - DNS:Edit
 */
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;

/**
 * Optional cache to avoid repeated zone lookups
 */
const zoneCache = new Map<string, string>();

/* ----------------------------------------
   TYPES
---------------------------------------- */

type CloudflareZone = {
  id: string;
  name: string;
};

type CloudflareDnsRecord = {
  id: string;
};

/* ----------------------------------------
   PUBLIC API
---------------------------------------- */

export async function createDnsRecord(
  domain: string,
  recordName: string,
  value: string
) {
  const zoneId = await getZoneId(domain);

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
    {
      method: "POST",
      headers: cfHeaders(),
      body: JSON.stringify({
        type: "TXT",
        name: recordName,
        content: value,
        ttl: 120,
      }),
    }
  );

  const json = await res.json();

  if (!json.success) {
    throw new Error(
      `Cloudflare DNS create failed: ${JSON.stringify(json.errors)}`
    );
  }

  return json.result.id as string;
}

export async function removeDnsRecord(
  domain: string,
  recordName: string
) {
  const zoneId = await getZoneId(domain);

  const record = await findDnsRecord(zoneId, recordName);

  if (!record) return;

  await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record.id}`,
    {
      method: "DELETE",
      headers: cfHeaders(),
    }
  );
}

/* ----------------------------------------
   INTERNAL HELPERS
---------------------------------------- */

async function getZoneId(domain: string): Promise<string> {
  const rootDomain = extractRootDomain(domain);

  if (zoneCache.has(rootDomain)) {
    return zoneCache.get(rootDomain)!;
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones?name=${rootDomain}`,
    {
      headers: cfHeaders(),
    }
  );

  const json = await res.json();

  if (!json.success || json.result.length === 0) {
    throw new Error(`Cloudflare zone not found for ${rootDomain}`);
  }

  const zoneId = (json.result[0] as CloudflareZone).id;
  zoneCache.set(rootDomain, zoneId);

  return zoneId;
}

async function findDnsRecord(
  zoneId: string,
  recordName: string
): Promise<CloudflareDnsRecord | null> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=TXT&name=${recordName}`,
    {
      headers: cfHeaders(),
    }
  );

  const json = await res.json();

  if (!json.success || json.result.length === 0) {
    return null;
  }

  return json.result[0];
}

function cfHeaders() {
  return {
    Authorization: `Bearer ${CF_API_TOKEN}`,
    "Content-Type": "application/json",
  };
}

/**
 * Extracts root domain:
 * foo.bar.example.com → example.com
 */
function extractRootDomain(domain: string): string {
  const parts = domain.split(".");
  if (parts.length <= 2) return domain;
  return parts.slice(-2).join(".");
}
