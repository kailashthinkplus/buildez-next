// /apps/web-app/app/api/auth/google/route.ts

import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { setTemporaryCookie } from "@/lib/auth/setCookies";

/**
 * Google OAuth Login Initiator
 *
 * This endpoint:
 *  - generates PKCE verifier + challenge
 *  - stores { verifier, ts } in encrypted temp cookie
 *  - redirects user to Google OAuth
 *
 * Callback will decide:
 *  - /app/onboarding if onboarding incomplete
 *  - /app/dashboard if onboarding completed
 */
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET(req: Request) {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = sha256ToBase64Url(verifier);

  // Save temporary PKCE verifier (short-lived, encrypted)
  await setTemporaryCookie(
    "google_oauth_state",
    JSON.stringify({
      verifier,
      ts: Date.now(),
    })
  );

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
    state: "google_oauth",
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  return NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
}

/* ------------------------------------------------------------
   SHA256 → Base64URL PKCE challenge
------------------------------------------------------------ */
function sha256ToBase64Url(input: string): string {
  const hash = createHash("sha256").update(input).digest("base64");
  return hash.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
