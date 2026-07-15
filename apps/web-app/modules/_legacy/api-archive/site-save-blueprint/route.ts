import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth/session"; // or "@/lib/db" depending on your actual import

export async function POST(req, { params }) {
  const { siteId } = params;
  const { blueprint } = await req.json();

  // Safeguard: ensure JSON, not null
  if (!blueprint) {
    return NextResponse.json({ ok: false, error: "No blueprint provided" }, { status: 400 });
  }

  // Save to DB
  await prisma.site.update({
    where: { id: siteId },
    data: {
      blueprint,
      updatedAt: new Date()
    }
  });

  return NextResponse.json({ ok: true });
}
