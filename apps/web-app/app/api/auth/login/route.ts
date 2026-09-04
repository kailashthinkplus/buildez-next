// /app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { AuthProvider, prisma } from "@buildez/db";
import { cookies } from "next/headers";
import { createSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing credentials" },
      { status: 400 }
    );
  }

  // 1️⃣ Validate user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 2️⃣ Create session row
  await createSession({ user, provider: AuthProvider.PASSWORD, ttlHours: 24 * 7 });

  // Prepare cookie store
  const cookieStore = await cookies();

  // 3️⃣ Load onboarding state to set onboarding cookie
  const onboarding = await prisma.userOnboarding.findUnique({
    where: { userId: user.id },
    select: { completed: true },
  });

  cookieStore.set({
    name: "onboarding",
    value: onboarding?.completed ? "completed" : "pending",
    httpOnly: false,        // MUST be client-readable for middleware
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  // 5️⃣ Success
  return NextResponse.json({ success: true });
}
