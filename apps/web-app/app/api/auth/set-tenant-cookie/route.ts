// /app/api/auth/set-tenant-cookie/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { findAccessibleTenant } from "@/lib/auth/tenantAccess";

export async function POST(req: Request) {
  const { tenantId } = await req.json();
  if (!tenantId) return NextResponse.json({ error: "missing tenantId" }, { status: 400 });

  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenant = await findAccessibleTenant(user.id, tenantId);
  if (!tenant || tenant.id !== tenantId) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("tenant-id", tenant.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.cookies.set("tenant-user-id", user.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
