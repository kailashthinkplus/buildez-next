// /apps/web-app/app/api/auth/recovery-login/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { hashRecovery } from "@/lib/auth/recovery";
import { writeAuthLog } from "@/lib/auth/authLog";
import { checkLockout } from "@/lib/auth/lockout";
import { AuthProvider } from "@prisma/client";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { email, code } = await req.json();

  try {
    /* ------------------------------------------------------------
       1️⃣ Anti-brute-force lockout
    ------------------------------------------------------------ */
    await checkLockout(email);

    /* ------------------------------------------------------------
       2️⃣ Find user
    ------------------------------------------------------------ */
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) throw new Error("Unauthorized");

    /* ------------------------------------------------------------
       3️⃣ Verify recovery code (hashed comparison)
    ------------------------------------------------------------ */
    const hashed = hashRecovery(code);

    if (!user.recoveryCodes.includes(hashed)) {
      await writeAuthLog({
        userId: user.id,
        provider: AuthProvider.OTP,
        success: false,
      });
      throw new Error("Invalid recovery code");
    }

    /* ------------------------------------------------------------
       4️⃣ Consume recovery code
    ------------------------------------------------------------ */
    await prisma.user.update({
      where: { id: user.id },
      data: {
        recoveryCodes: user.recoveryCodes.filter((c) => c !== hashed),
      },
    });

    /* ------------------------------------------------------------
       5️⃣ Create DB session (REPLACES JWT)
    ------------------------------------------------------------ */
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        provider: AuthProvider.OTP,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      },
    });

    const cookieStore = await cookies();

    cookieStore.set({
      name: "session",
      value: session.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    /* ------------------------------------------------------------
       6️⃣ Log success
    ------------------------------------------------------------ */
    await writeAuthLog({
      userId: user.id,
      provider: AuthProvider.OTP,
      success: true,
    });

    /* ------------------------------------------------------------
       7️⃣ Redirect to dashboard
    ------------------------------------------------------------ */
    return NextResponse.json({ redirect: "/app/dashboard" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Recovery login failed" },
      { status: 401 }
    );
  }
}
