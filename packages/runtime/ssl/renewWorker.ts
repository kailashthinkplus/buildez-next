/**
 * BuildEZ – SSL Auto Renew Worker
 * --------------------------------
 * - Finds expiring certificates
 * - Renews via ACME DNS-01
 * - Updates DB
 * - Safe to run repeatedly (cron)
 */

import { prisma } from "@buildez/db";
import { issueCertificate } from "./issueCertificate";
import { differenceInDays } from "date-fns";

const RENEW_BEFORE_DAYS = 30;

/* ----------------------------------------
   ENTRYPOINT
---------------------------------------- */

export async function runSslRenewalWorker() {
  console.log("[SSL] Renewal worker started");

  const domains = await db.siteDomain.findMany({
    where: {
      status: "VERIFIED",
    },
    include: {
      site: true,
      tenant: true,
    },
  });

  for (const domain of domains) {
    try {
      if (!domain.verifiedAt) continue;

      const cert = await db.sslCertificate.findFirst({
        where: {
          domain: domain.domain,
          status: "ISSUED",
        },
        orderBy: { expiresAt: "desc" },
      });

      if (!cert) continue;

      const daysLeft = differenceInDays(cert.expiresAt, new Date());

      if (daysLeft > RENEW_BEFORE_DAYS) {
        continue;
      }

      console.log(
        `[SSL] Renewing ${domain.domain} (expires in ${daysLeft} days)`
      );

      await issueCertificate({
        domain: domain.domain,
        siteId: domain.siteId,
        tenantId: domain.tenantId,
        isRenewal: true,
      });

      await db.systemNotification.create({
        data: {
          type: "SSL_RENEWED",
          title: "SSL Certificate Renewed",
          message: `SSL certificate for ${domain.domain} was successfully renewed.`,
          entityType: "SITE",
          entityId: domain.siteId,
        },
      });
    } catch (err) {
      console.error(`[SSL] Renewal failed for ${domain.domain}`, err);

      await db.systemNotification.create({
        data: {
          type: "SSL_RENEW_FAILED",
          title: "SSL Renewal Failed",
          message: `Automatic SSL renewal failed for ${domain.domain}.`,
          entityType: "SITE",
          entityId: domain.siteId,
        },
      });
    }
  }

  console.log("[SSL] Renewal worker finished");
}
