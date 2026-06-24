// /app/api/onboarding/account-type/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accountType } = await req.json();

    if (!accountType) {
      return NextResponse.json(
        { error: "Missing accountType" },
        { status: 400 }
      );
    }

    await prisma.userOnboarding.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        accountType,
        completed: false,
      },
      update: {
        accountType,
        completed: false,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ account-type error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
