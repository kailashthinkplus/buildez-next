// /app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@buildez/db";
import { AuthProvider } from "@prisma/client";
import { cookies } from "next/headers";

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
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      provider: AuthProvider.PASSWORD,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    },
  });

  // Prepare cookie store
  const cookieStore = await cookies();

  // 3️⃣ Set session cookie
  cookieStore.set({
    name: "session",
    value: session.id,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  // 4️⃣ Load onboarding state to set onboarding cookie
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
