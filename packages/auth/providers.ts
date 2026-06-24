// /Users/kailash/buildez/packages/auth/providers.ts

type GoogleAuthStartInput = {
  state: string;
};

/**
 * GOOGLE OAUTH – START
 *
 * Responsibilities:
 * - Build Google OAuth URL
 * - Preserve opaque state (role, redirect, etc.)
 * - NO cookies
 * - NO database
 * - NO framework coupling
 */
export async function googleAuthStart({
  state,
}: GoogleAuthStartInput): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appBaseUrl = process.env.APP_BASE_URL;

  if (!clientId) {
    throw new Error("Missing GOOGLE_CLIENT_ID");
  }

  if (!appBaseUrl) {
    throw new Error("Missing APP_BASE_URL");
  }

  const redirectUri = `${appBaseUrl}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
