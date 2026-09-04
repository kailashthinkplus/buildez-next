// Retired: super-admin login now goes exclusively through Google OAuth
// (see /super/login and /api/auth/google). This OTP-only path had no
// brute-force protection ahead of the single highest-privilege account type
// on the platform and is no longer linked from any UI. Kept as a stub
// (rather than deleted) so a stray client reference fails loudly instead of
// silently creating a weaker, unthrottled session-issuing path.
export async function POST() {
  return Response.json({ error: "This sign-in method is no longer available." }, { status: 410 });
}
