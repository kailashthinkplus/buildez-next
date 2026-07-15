// /Users/kailash/buildez/apps/web-app/app/api/workspaces/select/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  /* ---------------------------------------------------------
     1. Session check
  --------------------------------------------------------- */
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* ---------------------------------------------------------
     2. Parse body
  --------------------------------------------------------- */
  const { workspaceId } = await req.json();
  if (!workspaceId) {
    return NextResponse.json(
      { error: "workspaceId required" },
      { status: 400 }
    );
  }

  /* ---------------------------------------------------------
     3. Set workspace cookie (Next.js 16 → MUST use await cookies())
  --------------------------------------------------------- */
  const cookieStore = await cookies();

  cookieStore.set({
    name: "buildez_workspace",
    value: workspaceId,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ success: true });
}
