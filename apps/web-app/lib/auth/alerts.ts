import { prisma } from "@buildez/db";
import { sendSecurityEmail } from "./mailer";

export async function checkSuspiciousAuth(userId?: string) {
  if (!userId) return;

  const last10 = await db.authLog.findMany({
    where: {
      userId,
      success: false,
      createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) },
    },
  });

  if (last10.length >= 3) {
    await sendSecurityEmail(userId, "Multiple failed login attempts detected.");
  }
}
