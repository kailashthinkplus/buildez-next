import { AuthProvider, prisma } from "@buildez/db";
import { generateOtp, hashOtp } from "@/lib/auth/otp";
import { checkLockout } from "@/lib/auth/lockout";
import { writeAuthLog } from "@/lib/auth/authLog";

export async function POST(req: Request) {
  try {
    const { email: rawEmail } = await req.json();
    const email = String(rawEmail || "").trim().toLowerCase();
    if (!email) return Response.json({ error: "Email is required" }, { status: 400 });

    await checkLockout(email);
    const user = await prisma.user.findFirst({ where: { email, role: "SUPER_ADMIN", isActive: true } });
    if (!user) {
      await writeAuthLog({ provider: AuthProvider.OTP, success: false, message: "Unauthorized superadmin OTP request" });
      return Response.json({ error: "Invalid credentials" }, { status: 403 });
    }

    const otp = generateOtp();
    await prisma.otp.create({ data: { email, codeHash: hashOtp(otp), expiresAt: new Date(Date.now() + 5 * 60 * 1000) } });
    // The existing mail delivery integration can consume this in production.
    // Local development intentionally exposes it only in the server console.
    if (process.env.NODE_ENV !== "production") console.info(`[superadmin] OTP for ${email}: ${otp}`);
    await writeAuthLog({ userId: user.id, provider: AuthProvider.OTP, success: true });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to send OTP" }, { status: 400 });
  }
}
