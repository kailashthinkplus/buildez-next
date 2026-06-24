import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });

  // Clear all auth/session cookies
  res.cookies.set("session", "", { path: "/", maxAge: 0 });
  res.cookies.set("tenantId", "", { path: "/", maxAge: 0 });
  res.cookies.set("workspaceId", "", { path: "/", maxAge: 0 });

  // Optional: Google OAuth temporary cookies
  res.cookies.set("oauth_state", "", { path: "/", maxAge: 0 });
  res.cookies.set("oauth_verifier", "", { path: "/", maxAge: 0 });

  return res;
}
