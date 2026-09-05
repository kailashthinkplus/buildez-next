// /app/api/onboarding/save-domain/route.ts

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@buildez/db";
import { validDomain } from "@/lib/domain-provisioning";
import { isFreePlanCode } from "@/lib/plan/freePlanCode";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { domain } = await req.json();

    const onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: user.id },
    });

    if (!onboarding) {
      return NextResponse.json(
        { error: "Onboarding missing" },
        { status: 400 }
      );
    }

    const isFreePlan = isFreePlanCode(onboarding.planCode);

    /* --------------------------------------------------------
       CASE 1 — SKIP DOMAIN
    -------------------------------------------------------- */
    if (!domain || domain === "") {
      await prisma.userOnboarding.update({
        where: { userId: user.id },
        data: { domain: null, domainSkipped: true },
      });

      return NextResponse.json({
        success: true,
        skipped: true,
      });
    }

    /* --------------------------------------------------------
       CASE 2 — NORMALIZATION
    -------------------------------------------------------- */
    let normalized = String(domain).toLowerCase().trim();
    normalized = normalized.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const platformDomain = process.env.PLATFORM_DOMAIN || "getbuildezy.com";
    if (isFreePlan) {
      const requestedLabel = normalized.endsWith(`.${platformDomain}`)
        ? normalized.slice(0, -(platformDomain.length + 1))
        : normalized.split(".")[0];
      normalized = `${requestedLabel.replace(/[^a-z0-9-]/g, "").replace(/^-|-$/g, "")}.${platformDomain}`;
    } else {
      normalized = normalized.split("/")[0].replace(/\.$/, "");
    }

    /* --------------------------------------------------------
       VALIDATION
    -------------------------------------------------------- */
    if (!validDomain(normalized)) {
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    if (!normalized.includes(".")) {
      return NextResponse.json(
        { error: "Domain must contain a valid TLD (e.g., .com, .in)" },
        { status: 400 }
      );
    }

    if (normalized.length < 3 || normalized.length > 253) {
      return NextResponse.json(
        { error: "Domain must be between 3 and 253 characters" },
        { status: 400 }
      );
    }

    const RESERVED = [
      platformDomain,
      `www.${platformDomain}`,
      `admin.${platformDomain}`,
      `app.${platformDomain}`,
      `api.${platformDomain}`,
    ];

    if (RESERVED.includes(normalized)) {
      return NextResponse.json(
        { error: "This domain is not available" },
        { status: 409 }
      );
    }

    if (!isFreePlan && normalized.endsWith(`.${platformDomain}`)) {
      return NextResponse.json(
        { error: "Choose a domain you own, or skip this step to use your platform address" },
        { status: 400 },
      );
    }

    if (isFreePlan) {
      const siteSlug = normalized.slice(0, -(platformDomain.length + 1));
      const siteExists = await prisma.site.findFirst({ where: { slug: siteSlug, deletedAt: null }, select: { id: true } });
      if (siteExists) return NextResponse.json({ error: "This address is already in use" }, { status: 409 });
    }

    /* --------------------------------------------------------
       GLOBAL UNIQUE CHECK
    -------------------------------------------------------- */
    const exists = await prisma.siteDomain.findUnique({
      where: { domain: normalized },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Domain already in use" },
        { status: 409 }
      );
    }

    /* --------------------------------------------------------
       SAVE ONBOARDING DOMAIN CHOICE
    -------------------------------------------------------- */
    await prisma.userOnboarding.update({
      where: { userId: user.id },
      data: { domain: normalized, domainSkipped: false },
    });

    return NextResponse.json({
      success: true,
      domain: normalized,
    });

  } catch (err) {
    console.error("❌ save-domain error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
