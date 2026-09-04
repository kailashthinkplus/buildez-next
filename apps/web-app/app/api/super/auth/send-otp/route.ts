// Retired: super-admin login is Google OAuth only (see /super/login). This
// route had zero live UI callers and issued a session before any TOTP check
// ran. Kept as a stub rather than deleted so a stray reference fails loudly.
export async function POST() {
  return Response.json({ error: "This sign-in method is no longer available." }, { status: 410 });
}
