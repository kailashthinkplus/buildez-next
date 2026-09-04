import { prisma } from "@buildez/db";
import { provisionNginxDomain } from "@/lib/domain-provisioning";
import { checkDomainPropagation } from "./dns-verification";

type DomainRecord = { id: string; domain: string; verificationToken: string | null };

/**
 * Runs one propagation check + (on success) SSL provisioning for a single
 * domain. Shared by the manual "Verify" button and the auto-verify
 * scheduler below so there's one place that owns the PENDING -> VERIFIED
 * transition.
 */
export async function verifyDomainRecord(record: DomainRecord) {
  if (!record.verificationToken) return { verified: false, skipped: true as const };

  const propagation = await checkDomainPropagation(record.domain, record.verificationToken);
  const checkedAt = new Date();

  if (!propagation.ready) {
    await prisma.siteDomain.update({
      where: { id: record.id },
      data: { lastCheckedAt: checkedAt, lastDnsResult: propagation },
    });
    return { verified: false, propagation };
  }

  await prisma.siteDomain.update({
    where: { id: record.id },
    data: { dnsVerifiedAt: checkedAt, lastCheckedAt: checkedAt, lastDnsResult: propagation, sslStatus: "PROVISIONING" },
  });

  try {
    const provisioning = await provisionNginxDomain("add", record.domain);
    if (provisioning.skipped) {
      await prisma.siteDomain.update({ where: { id: record.id }, data: { status: "PENDING", sslStatus: "PENDING" } });
      return { verified: false, propagation, provisioning, activationPending: true };
    }
    await prisma.siteDomain.update({
      where: { id: record.id },
      data: { status: "VERIFIED", verifiedAt: checkedAt, sslStatus: "ACTIVE", sslActivatedAt: checkedAt },
    });
    return { verified: true, propagation, provisioning };
  } catch (error) {
    await prisma.siteDomain.update({ where: { id: record.id }, data: { status: "FAILED", sslStatus: "FAILED" } });
    return { verified: false, error };
  }
}

/**
 * Sweeps every PENDING domain and verifies whichever ones have propagated,
 * so a user who added their DNS records doesn't have to come back and
 * click "Verify" once the (up to ~60 minute) propagation window passes.
 */
export async function runDueDomainVerifications() {
  const pending = await prisma.siteDomain.findMany({
    where: { status: "PENDING", verificationToken: { not: null } },
    select: { id: true, domain: true, verificationToken: true },
  });

  let verified = 0;
  for (const record of pending) {
    try {
      const result = await verifyDomainRecord(record);
      if (result.verified) verified += 1;
    } catch (error) {
      console.error("[domain auto-verify] check failed for", record.domain, error);
    }
  }
  return { checked: pending.length, verified };
}
