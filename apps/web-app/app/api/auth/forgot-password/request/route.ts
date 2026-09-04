import { NextResponse } from "next/server";
import { AuthProvider, prisma } from "@buildez/db";
import { generateOtp, hashOtp } from "@/lib/auth/otp";
import { checkLockout } from "@/lib/auth/lockout";
import { writeAuthLog } from "@/lib/auth/authLog";
import { sendMail } from "@/lib/email/sendMail";
import { otpEmailContent } from "@/lib/email/otpTemplate";

const PURPOSE = "PASSWORD_RESET";

export async function POST(req: Request) {
  const { email: rawEmail } = await req.json().catch(() => ({ email: "" }));
  const email = String(rawEmail || "").trim().toLowerCase();

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  await checkLockout(email);

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  /*
   * Always respond with the same generic success message whether or
   * not an account exists — a differing response would let anyone
   * enumerate registered emails through this form.
   */
  if (user) {
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otp.create({
      data: { email, codeHash: hashOtp(otp), expiresAt, purpose: PURPOSE },
    });

    const { subject, text, html } = otpEmailContent({ code: otp, purpose: "reset your password" });
    await sendMail({ to: email, subject, text, html });

    await writeAuthLog({ userId: user.id, provider: AuthProvider.OTP, success: true });
  }

  return NextResponse.json({
    success: true,
    message: "If an account exists for that email, a verification code has been sent.",
  });
}
