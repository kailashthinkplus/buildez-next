// /app/api/onboarding/check-domain/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";

export async function POST(req: Request) {
  try {
    const { domain } = await req.json();

    if (!domain) {
      return NextResponse.json({ error: "Domain required" }, { status: 400 });
    }

    const exists = await db.siteDomain.findUnique({
      where: { domain: domain.toLowerCase().trim() },
    });

    return NextResponse.json({ available: !exists });
  } catch (err) {
    console.error("❌ check-domain error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
