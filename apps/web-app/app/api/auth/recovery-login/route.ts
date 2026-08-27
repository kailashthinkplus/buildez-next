// /apps/web-app/app/api/auth/recovery-login/route.ts

import { NextResponse } from "next/server";
import { AuthProvider, prisma } from "@buildez/db";
import { hashRecovery } from "@/lib/auth/recovery";
import { writeAuthLog } from "@/lib/auth/authLog";
import { checkLockout } from "@/lib/auth/lockout";
import { createSession } from "@/lib/auth/session";

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
    await createSession({ user, provider: AuthProvider.OTP, ttlHours: 24 * 7 });

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
