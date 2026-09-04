import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { AuthProvider, UserRole, prisma } from "@buildez/db";
import { createSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const accountType = body.accountType === "business" ? "business" : "personal";
    const businessName = accountType === "business" ? String(body.businessName || "").trim() : null;

    if (!email || !/^\S+@\S+\.\S+$/.test(email) || !firstName || !lastName) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (accountType === "business" && !businessName) {
      return NextResponse.json({ error: "Business name is required." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { email, name: `${firstName} ${lastName}`.trim(), passwordHash, role: UserRole.TENANT_ADMIN, isEmailVerified: false },
      });
      await tx.userOnboarding.create({
        data: { userId: created.id, accountType, firstName, lastName, businessName, completed: false },
      });
      return created;
    });

    await createSession({ user, provider: AuthProvider.PASSWORD, ttlHours: 24 * 7 });
    const cookieStore = await cookies();
    cookieStore.set({ name: "onboarding", value: "pending", httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
    return NextResponse.json({ success: true, redirect: "/app/onboarding" }, { status: 201 });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json({ error: "Unable to create your account right now." }, { status: 500 });
  }
}
