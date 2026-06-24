// /apps/web-app/lib/auth/setCookies.ts

import { cookies } from "next/headers";

const isProd = process.env.NODE_ENV === "production";

/**
 * Temporary cookies for OAuth (state, PKCE verifier).
 * MUST NOT be httpOnly so Google callback can read it!
 */
export async function setTemporaryCookie(
  name: string,
  value: string,
  minutes = 10
) {
  const cookieStore = await cookies();

  cookieStore.set({
    name,                       // DO NOT prefix, Google callback must read exact name
    value,
    httpOnly: false,            // ❗ CRITICAL FIX
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: minutes * 60,
  });
}

/**
 * Read the plaintext temporary OAuth cookie
 */
export async function getTemporaryCookie(name: string): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value ?? null;
}

/**
 * Clear OAuth temporary cookie
 */
export async function clearTemporaryCookie(name: string) {
  const cookieStore = await cookies();

  cookieStore.set({
    name,
    value: "",
    expires: new Date(0),
    path: "/",
  });
}
