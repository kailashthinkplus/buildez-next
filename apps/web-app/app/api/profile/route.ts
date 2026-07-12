import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getCurrentUser } from "@/lib/auth/session";

const profileSelect = {
  id: true, email: true, phone: true, name: true, avatarUrl: true,
  bio: true, jobTitle: true, company: true, website: true,
  city: true, country: true, timezone: true,
  isEmailVerified: true, isPhoneVerified: true, createdAt: true,
} as const;

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const result = value.trim();
  return result ? result.slice(0, max) : null;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await prisma.user.findUnique({ where: { id: user.id }, select: profileSelect });
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const name = clean(body.name, 100);
    if (!name) return NextResponse.json({ error: "Full name is required" }, { status: 400 });

    const email = clean(body.email, 254)?.toLowerCase() ?? null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });

    const phone = clean(body.phone, 24);
    if (phone && !/^\+?[0-9 ()-]{7,24}$/.test(phone))
      return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });

    const website = clean(body.website, 300);
    if (website) {
      try { new URL(website); } catch { return NextResponse.json({ error: "Website must include http:// or https://" }, { status: 400 }); }
    }
    const avatarUrl = clean(body.avatarUrl, 1000);
    if (avatarUrl) {
      try { new URL(avatarUrl); } catch { return NextResponse.json({ error: "Avatar must be a valid URL" }, { status: 400 }); }
    }

    const profile = await prisma.user.update({
      where: { id: user.id },
      data: {
        name, email, phone, avatarUrl, website,
        bio: clean(body.bio, 500), jobTitle: clean(body.jobTitle, 100),
        company: clean(body.company, 120), city: clean(body.city, 100),
        country: clean(body.country, 100), timezone: clean(body.timezone, 100),
        ...(email !== user.email ? { isEmailVerified: false } : {}),
        ...(phone !== user.phone ? { isPhoneVerified: false } : {}),
      },
      select: profileSelect,
    });
    return NextResponse.json({ profile });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return NextResponse.json({ error: "That email or phone number is already in use" }, { status: 409 });
    return NextResponse.json({ error: "Unable to update profile" }, { status: 500 });
  }
}
