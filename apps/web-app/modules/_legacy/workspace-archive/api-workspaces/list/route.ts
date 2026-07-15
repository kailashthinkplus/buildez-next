import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getSessionUser } from "@/lib/auth/context";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const tenant = await db.tenant.create({
    data: {
      name,
      users: {
        connect: { id: user.id },
      },
    },
  });

  return NextResponse.json({ tenant });
}
