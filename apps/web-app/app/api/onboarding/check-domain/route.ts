// /app/api/onboarding/check-domain/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { validDomain } from "@/lib/domain-provisioning";

export async function POST(req: Request) {
  try {
    const { domain } = await req.json();

    if (!domain) {
      return NextResponse.json({ error: "Domain required" }, { status: 400 });
    }

    const normalized = String(domain).toLowerCase().trim().replace(/^https?:\/\//, "").split("/")[0].replace(/\.$/, "");
    const platformDomain = process.env.PLATFORM_DOMAIN || "getbuildezy.com";
    if (!validDomain(normalized) || normalized === platformDomain || normalized.endsWith(`.${platformDomain}`)) {
      return NextResponse.json({ error: "Enter a valid domain you own" }, { status: 400 });
    }

    const exists = await prisma.siteDomain.findUnique({
      where: { domain: normalized },
    });

    return NextResponse.json({ available: !exists });
  } catch (err) {
    console.error("❌ check-domain error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
