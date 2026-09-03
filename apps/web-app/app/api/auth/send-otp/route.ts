// /apps/web-app/app/api/auth/send-otp/route.ts

import { authHandler } from "@/lib/api/handler";
import { AuthProvider, prisma } from "@buildez/db";
import { generateOtp, hashOtp } from "@/lib/auth/otp";
import { checkLockout } from "@/lib/auth/lockout";
import { writeAuthLog } from "@/lib/auth/authLog";
import { sendMail } from "@/lib/email/sendMail";
import { otpEmailContent } from "@/lib/email/otpTemplate";

export const POST = authHandler(async ({ req }) => {
  const { email } = await req.json();

  if (!email) {
    return {
      success: false,
      error: {
        code: "EMAIL_REQUIRED",
        message: "Email is required.",
      },
      status: 400,
    };
  }

  /* ---------------------------------------------------------------
     1️⃣ Throttle / Lockout Check
  --------------------------------------------------------------- */
  await checkLockout(email);

  /* ---------------------------------------------------------------
     2️⃣ Only SUPER_ADMIN can request OTP
  --------------------------------------------------------------- */
  const user = await prisma.user.findFirst({
    where: { email, role: "SUPER_ADMIN" },
  });

  if (!user) {
    await writeAuthLog({
      provider: AuthProvider.OTP,
      success: false,
      message: "Unauthorized OTP attempt",
    });

    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid credentials.",
      },
      status: 403,
    };
  }

  /* ---------------------------------------------------------------
     3️⃣ Generate OTP
  --------------------------------------------------------------- */
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  /* ---------------------------------------------------------------
     4️⃣ Store hashed OTP in DB
  --------------------------------------------------------------- */
  await prisma.otp.create({
    data: {
      email,
      codeHash: hashOtp(otp),
      expiresAt,
    },
  });

  /* ---------------------------------------------------------------
     5️⃣ Send OTP
  --------------------------------------------------------------- */
  const { subject, text, html } = otpEmailContent({ code: otp, purpose: "sign in to your account", expiresInMinutes: 5 });
  await sendMail({ to: email, subject, text, html });

  /* ---------------------------------------------------------------
     6️⃣ Audit Log
  --------------------------------------------------------------- */
  await writeAuthLog({
    userId: user.id,
    provider: AuthProvider.OTP,
    success: true,
  });

  /* ---------------------------------------------------------------
     7️⃣ Response
  --------------------------------------------------------------- */
  return { success: true };
});
