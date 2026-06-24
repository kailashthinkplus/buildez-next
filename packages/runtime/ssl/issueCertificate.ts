/**
 * BuildEZ – SSL Certificate Issuance (DNS-01)
 * -------------------------------------------
 * Issues SSL certificates using ACME (Let's Encrypt)
 * via DNS-01 challenge.
 *
 * ❗ MUST be executed from a background worker / queue
 * ❗ Private keys are stored on disk, never in DB
 */

import fs from "fs/promises";
import path from "path";
import acme from "acme-client";
import { prisma } from "@buildez/db";
import {
  createDnsRecord,
  removeDnsRecord,
} from "./providers/cloudflare";
import { getRuntimeAdapter } from "../adapters";

/* ----------------------------------------
   TYPES
---------------------------------------- */

export type IssueCertificateInput = {
  siteId: string;
  tenantId: string;
  domain: string;
};

export type IssueCertificateResult = {
  success: boolean;
  certPath?: string;
  keyPath?: string;
  expiresAt?: Date;
  error?: string;
};

/* ----------------------------------------
   CONFIG
---------------------------------------- */

const ACME_DIRECTORY =
  process.env.ACME_DIRECTORY ??
  acme.directory.letsencrypt.production;

const CERT_STORAGE_ROOT =
  process.env.SSL_CERT_PATH ?? "/var/buildez/certs";

const ACME_ACCOUNT_EMAIL =
  process.env.ACME_ACCOUNT_EMAIL ?? "ssl@buildez.com";

/* ----------------------------------------
   MAIN FUNCTION
---------------------------------------- */

export async function issueCertificate(
  input: IssueCertificateInput
): Promise<IssueCertificateResult> {
  const { siteId, tenantId, domain } = input;

  const runtime = getRuntimeAdapter();

  try {
    /* ----------------------------------
       1. Prepare storage
    ---------------------------------- */
    const certDir = path.join(
      CERT_STORAGE_ROOT,
      tenantId,
      siteId
    );

    await fs.mkdir(certDir, { recursive: true });

    const keyPath = path.join(certDir, `${domain}.key.pem`);
    const certPath = path.join(certDir, `${domain}.cert.pem`);

    /* ----------------------------------
       2. Generate private key
    ---------------------------------- */
    const privateKey = await acme.forge.createPrivateKey();
    await fs.writeFile(keyPath, privateKey, "utf8");

    /* ----------------------------------
       3. Init ACME client
    ---------------------------------- */
    const client = new acme.Client({
      directoryUrl: ACME_DIRECTORY,
      accountKey: await getOrCreateAcmeAccountKey(),
    });

    await client.createAccount({
      termsOfServiceAgreed: true,
      contact: [`mailto:${ACME_ACCOUNT_EMAIL}`],
    });

    /* ----------------------------------
       4. Create CSR
    ---------------------------------- */
    const [, csr] = await acme.forge.createCsr({
      commonName: domain,
      altNames: [domain],
    });

    /* ----------------------------------
       5. Issue certificate (DNS-01)
    ---------------------------------- */
    const cert = await client.auto({
      csr,
      email: ACME_ACCOUNT_EMAIL,
      termsOfServiceAgreed: true,
      challengePriority: ["dns-01"],

      challengeCreateFn: async (authz, challenge) => {
        await createDnsRecord(
          authz.identifier.value,
          challenge.dnsRecordName,
          challenge.dnsRecordValue
        );
      },

      challengeRemoveFn: async (authz, challenge) => {
        await removeDnsRecord(
          authz.identifier.value,
          challenge.dnsRecordName
        );
      },
    });

    /* ----------------------------------
       6. Persist cert
    ---------------------------------- */
    await fs.writeFile(certPath, cert, "utf8");

    const expiresAt = extractExpiryFromCert(cert);

    /* ----------------------------------
       7. Mark domain verified
    ---------------------------------- */
    await db.siteDomain.update({
      where: { domain },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
      },
    });

    /* ----------------------------------
       8. Attach cert to runtime (NGINX / EDGE)
    ---------------------------------- */
    await runtime.attachCertificate(domain);

    return {
      success: true,
      certPath,
      keyPath,
      expiresAt,
    };
  } catch (error: any) {
    console.error("SSL_ISSUE_ERROR", error);

    await db.siteDomain.update({
      where: { domain },
      data: { status: "FAILED" },
    });

    await db.systemNotification.create({
      data: {
        type: "SSL_FAILURE",
        title: "SSL issuance failed",
        message: `SSL certificate issuance failed for ${domain}`,
        entityType: "SITE_DOMAIN",
        entityId: domain,
      },
    });

    return {
      success: false,
      error: error?.message ?? "SSL issuance failed",
    };
  }
}

/* ----------------------------------------
   ACME ACCOUNT KEY (CACHED)
---------------------------------------- */

let cachedAccountKey: string | null = null;

async function getOrCreateAcmeAccountKey(): Promise<string> {
  if (cachedAccountKey) return cachedAccountKey;

  const keyPath = path.join(
    CERT_STORAGE_ROOT,
    "acme-account.key.pem"
  );

  try {
    cachedAccountKey = await fs.readFile(keyPath, "utf8");
  } catch {
    cachedAccountKey = await acme.forge.createPrivateKey();
    await fs.writeFile(keyPath, cachedAccountKey, "utf8");
  }

  return cachedAccountKey;
}

/* ----------------------------------------
   CERT UTIL
---------------------------------------- */

function extractExpiryFromCert(certPem: string): Date {
  const match = certPem.match(/Not After\s*:\s*(.+)/i);

  if (!match) {
    // Fallback to LE default (90 days)
    return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  }

  return new Date(match[1]);
}
