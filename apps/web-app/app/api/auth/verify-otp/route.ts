// /apps/web-app/app/api/auth/verify-otp/route.ts

import { NextResponse } from "next/server";
import { AuthProvider, prisma } from "@buildez/db";
import { hashOtp } from "@/lib/auth/otp";
import { checkLockout } from "@/lib/auth/lockout";
import { writeAuthLog } from "@/lib/auth/authLog";
import { createSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  try {
    /* ------------------------------------------------------------
       1️⃣ Lockout / Throttling
    ------------------------------------------------------------ */
    await checkLockout(email);

    /* ------------------------------------------------------------
       2️⃣ Load OTP record
    ------------------------------------------------------------ */
    const record = await prisma.otp.findFirst({
      where: {
        email,
        consumed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    // Invalid or expired OTP
    if (!record || record.codeHash !== hashOtp(otp)) {
      await writeAuthLog({
        provider: AuthProvider.OTP,
        success: false,
      });
      throw new Error("Invalid OTP");
    }

    /* ------------------------------------------------------------
       3️⃣ Mark OTP consumed
    ------------------------------------------------------------ */
    await prisma.otp.update({
      where: { id: record.id },
      data: { consumed: true },
    });

    /* ------------------------------------------------------------
       4️⃣ Load SUPER_ADMIN user
    ------------------------------------------------------------ */
    const user = await prisma.user.findFirst({
      where: { email, role: "SUPER_ADMIN" },
    });

    if (!user) {
      throw new Error("Unauthorized");
    }

    /* ------------------------------------------------------------
       5️⃣ Create DB session (NOT JWT)
    ------------------------------------------------------------ */
    await createSession({ user, provider: AuthProvider.OTP, ttlHours: 4 });

    /* ------------------------------------------------------------
       6️⃣ Auth Log
    ------------------------------------------------------------ */
    await writeAuthLog({
      userId: user.id,
      provider: AuthProvider.OTP,
      success: true,
    });

    /* ------------------------------------------------------------
       7️⃣ Handle optional TOTP flow
    ------------------------------------------------------------ */
    if (user.totpEnabled) {
      return NextResponse.json({ redirect: "/super/totp" });
    }

    /* ------------------------------------------------------------
       8️⃣ Success → redirect to SUPER ADMIN Dashboard
    ------------------------------------------------------------ */
    return NextResponse.json({ redirect: "/super/dashboard" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "OTP verification failed" },
      { status: 401 }
    );
  }
}
