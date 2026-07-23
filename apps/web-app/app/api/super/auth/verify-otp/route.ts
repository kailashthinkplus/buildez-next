import { NextResponse } from "next/server";
import { AuthProvider, prisma } from "@buildez/db";
import { hashOtp } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  const record = await prisma.otp.findFirst({
    where: {
      email,
      consumed: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.codeHash !== hashOtp(otp)) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
  }

  await prisma.otp.update({
    where: { id: record.id },
    data: { consumed: true },
  });

  const user = await prisma.user.findFirst({
    where: { email, role: "SUPER_ADMIN" },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await createSession({
    user,
    provider: AuthProvider.OTP,
    ttlHours: 4,
  });

  if (user.totpEnabled) {
    return NextResponse.json({ redirect: "/super/totp" });
  }

  return NextResponse.json({ redirect: "/super/dashboard" });
}
