import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@buildez/db";
import { verifyFirebasePhoneToken } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { idToken } = await req.json().catch(() => ({ idToken: "" }));
  if (!idToken || typeof idToken !== "string") {
    return NextResponse.json({ error: "Missing verification token." }, { status: 400 });
  }

  let verified: { phone: string } | null;
  try {
    verified = await verifyFirebasePhoneToken(idToken);
  } catch (error) {
    console.error("VERIFY PHONE ERROR:", error);
    return NextResponse.json({ error: "That verification could not be confirmed. Please try again." }, { status: 400 });
  }

  if (!verified) {
    return NextResponse.json({ error: "That verification could not be confirmed. Please try again." }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({
    where: { phone: verified.phone, NOT: { id: user.id } },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ error: "That phone number is already linked to another account." }, { status: 409 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { phone: verified.phone, isPhoneVerified: true },
  });

  return NextResponse.json({ success: true, phone: verified.phone });
}
