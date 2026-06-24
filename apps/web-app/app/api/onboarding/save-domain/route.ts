// /app/api/onboarding/save-domain/route.ts

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@buildez/db";

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

    /* --------------------------------------------------------
       ⭐ NEW: PAID PLANS SHOULD NOT SAVE DOMAIN AT ALL
       Domain step is SKIPPED — avoid resetting onboarding.domain=null
    -------------------------------------------------------- */
    if (onboarding.planCode !== "trial") {
      return NextResponse.json({
        success: true,
        skippedBecausePaid: true,
      });
    }

    /* --------------------------------------------------------
       CASE 1 — SKIP DOMAIN (ONLY FOR TRIAL)
    -------------------------------------------------------- */
    if (!domain || domain === "") {
      await prisma.userOnboarding.update({
        where: { userId: user.id },
        data: { domain: null },
      });

      return NextResponse.json({
        success: true,
        skipped: true,
      });
    }

    /* --------------------------------------------------------
       CASE 2 — NORMALIZATION
    -------------------------------------------------------- */
    let normalized = domain.toLowerCase().trim();
    normalized = normalized.replace(/^https?:\/\//, "").replace(/\/$/, "");

    /* --------------------------------------------------------
       VALIDATION
    -------------------------------------------------------- */
    if (!/^[a-z0-9.-]+$/.test(normalized)) {
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

    if (normalized.length < 3 || normalized.length > 63) {
      return NextResponse.json(
        { error: "Domain must be between 3 and 63 characters" },
        { status: 400 }
      );
    }

    const RESERVED = [
      "buildez.app",
      "www.buildez.app",
      "admin.buildez.app",
    ];

    if (RESERVED.includes(normalized)) {
      return NextResponse.json(
        { error: "This domain is not available" },
        { status: 409 }
      );
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
       SAVE FOR TRIAL ONBOARDING
    -------------------------------------------------------- */
    await prisma.userOnboarding.update({
      where: { userId: user.id },
      data: { domain: normalized },
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
