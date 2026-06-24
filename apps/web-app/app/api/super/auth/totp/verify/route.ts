import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { verifyTOTP } from "@buildez/auth";
import { checkLockout } from "@/lib/auth/lockout";
import { writeAuthLog } from "@/lib/auth/authLog";
import { AuthProvider } from "@prisma/client";

export async function POST(req: Request) {
  const { userId, code } = await req.json();

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await checkLockout(user.email);

    const valid = verifyTOTP(user.totpSecret!, code);

    if (!valid) {
      await writeAuthLog({
        userId: user.id,
        provider: AuthProvider.OTP,
        success: false,
      });
      throw new Error("Invalid TOTP");
    }

    await writeAuthLog({
      userId: user.id,
      provider: AuthProvider.OTP,
      success: true,
    });

    return NextResponse.json({ redirect: "/super/dashboard" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
