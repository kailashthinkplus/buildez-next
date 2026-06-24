// /app/api/auth/set-tenant-cookie/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { tenantId } = await req.json();
  if (!tenantId) return NextResponse.json({ error: "missing tenantId" }, { status: 400 });

  const res = NextResponse.json({ success: true });

  res.headers.append(
    "Set-Cookie",
    `buildez_tenant=${tenantId}; Path=/; HttpOnly; SameSite=Lax`
  );

  return res;
}
