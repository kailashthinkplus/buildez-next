import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { AuthProvider, prisma } from "@buildez/db";
import { hashOtp } from "@/lib/auth/otp";
import { checkLockout } from "@/lib/auth/lockout";
import { writeAuthLog } from "@/lib/auth/authLog";
import { createSession } from "@/lib/auth/session";

const PURPOSE = "PASSWORD_RESET";
const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const otp = String(body.otp || "").trim();
  const newPassword = String(body.newPassword || "");

  if (!email || !otp) {
    return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  await checkLockout(email);

  const record = await prisma.otp.findFirst({
    where: { email, purpose: PURPOSE, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.attempts >= MAX_ATTEMPTS) {
    await writeAuthLog({ provider: AuthProvider.OTP, success: false });
    return NextResponse.json({ error: "That code is invalid or has expired." }, { status: 400 });
  }

  if (record.codeHash !== hashOtp(otp)) {
    await prisma.otp.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    await writeAuthLog({ provider: AuthProvider.OTP, success: false });
    return NextResponse.json({ error: "That code is invalid or has expired." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "That code is invalid or has expired." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.otp.update({ where: { id: record.id }, data: { consumed: true } }),
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
  ]);

  await createSession({ user, provider: AuthProvider.PASSWORD, ttlHours: 24 * 7 });
  await writeAuthLog({ userId: user.id, provider: AuthProvider.OTP, success: true });

  return NextResponse.json({ success: true, redirect: "/app" });
}
