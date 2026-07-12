import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@buildez/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function PATCH(request: Request) {
  const sessionUser = await getCurrentUser(request);
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { currentPassword, newPassword, confirmPassword } = await request.json();
    if (typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 128)
      return NextResponse.json({ error: "New password must be between 8 and 128 characters" }, { status: 400 });
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword))
      return NextResponse.json({ error: "Use an uppercase letter, lowercase letter, and number" }, { status: 400 });
    if (newPassword !== confirmPassword) return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: sessionUser.id }, select: { passwordHash: true } });
    if (user?.passwordHash) {
      if (!currentPassword || !(await bcrypt.compare(currentPassword, user.passwordHash)))
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: sessionUser.id }, data: { passwordHash } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to update password" }, { status: 500 });
  }
}
