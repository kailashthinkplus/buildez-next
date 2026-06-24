// /app/api/auth/google/callback/route.ts

import {
  prisma,
  AuthProvider,
  UserRole,
} from "@buildez/db";
import {
  getTemporaryCookie,
  clearTemporaryCookie,
} from "@/lib/auth/setCookies";
import { writeAuthLog } from "@/lib/auth/authLog";
import { createSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

/* ------------------------------------------------------------
   Ensure Onboarding row exists (never create tenant here)
------------------------------------------------------------ */
async function ensureOnboarding(userId: string) {
  const exists = await prisma.userOnboarding.findUnique({
    where: { userId },
  });

  if (!exists) {
    await prisma.userOnboarding.create({
      data: { userId, completed: false },
    });
  }
}

/* ------------------------------------------------------------
   GOOGLE OAuth Callback Handler
------------------------------------------------------------ */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const returnedState = url.searchParams.get("state");

    if (!code || returnedState !== "google_oauth") {
      return NextResponse.redirect(new URL("/app/login?error=oauth", req.url));
    }

    /* ------------------------------------------------------------
       1) Load PKCE verifier from temp cookie
    ------------------------------------------------------------ */
    const stateCookie = await getTemporaryCookie("google_oauth_state");
    if (!stateCookie) {
      return NextResponse.redirect(new URL("/app/login?error=state", req.url));
    }

    let oauthState;
    try {
      oauthState = JSON.parse(stateCookie);
    } catch {
      return NextResponse.redirect(
        new URL("/app/login?error=state_parse", req.url)
      );
    }

    const { verifier } = oauthState;

    await clearTemporaryCookie("google_oauth_state");

    /* ------------------------------------------------------------
       2) Exchange OAuth code → access token
    ------------------------------------------------------------ */
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL("/app/login?error=token", req.url));
    }

    const token = await tokenRes.json();

    /* ------------------------------------------------------------
       3) Fetch Google profile
    ------------------------------------------------------------ */
    const profileRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });

    if (!profileRes.ok) {
      return NextResponse.redirect(
        new URL("/app/login?error=profile", req.url)
      );
    }

    const profile = await profileRes.json();
    const email = profile.email;
    const googleId = profile.id;

    if (!email || !googleId) {
      return NextResponse.redirect(
        new URL("/app/login?error=missing_profile", req.url)
      );
    }

    /* ------------------------------------------------------------
       4) Find or create user (do NOT touch tenantId)
    ------------------------------------------------------------ */
    let user = await prisma.user.findFirst({
      where: { OR: [{ email }, { googleId }] },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          name: profile.name,
          avatarUrl: profile.picture,
          role: UserRole.TENANT_ADMIN,
          isEmailVerified: true,
        },
      });
    }

    /* ------------------------------------------------------------
       ❗ NEVER create tenant automatically
       Onboarding must handle it
    ------------------------------------------------------------ */
    await ensureOnboarding(user.id);

    /* ------------------------------------------------------------
       5) Create DB session cookie
    ------------------------------------------------------------ */
    await createSession({
      user,
      provider: AuthProvider.GOOGLE,
      ttlHours: 24 * 7,
    });

    /* ------------------------------------------------------------
       6) Write Auth Log
    ------------------------------------------------------------ */
    await writeAuthLog({
      userId: user.id,
      provider: AuthProvider.GOOGLE,
      success: true,
      ipAddress: req.headers.get("x-forwarded-for") ?? "",
      userAgent: req.headers.get("user-agent") ?? "",
    });

    /* ------------------------------------------------------------
       7) Determine redirect target
          - If onboarding.completed → /app/dashboard
          - Otherwise → /app/onboarding
    ------------------------------------------------------------ */
    const onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: user.id },
      select: { completed: true },
    });

    const target =
      onboarding?.completed === true
        ? "/app/dashboard"
        : "/app/onboarding";

    return NextResponse.redirect(new URL(target, req.url));
  } catch (err) {
    console.error("GOOGLE CALLBACK ERROR:", err);
    return NextResponse.redirect(new URL("/app/login?error=server", req.url));
  }
}
