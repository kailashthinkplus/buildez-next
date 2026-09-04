// Retired: see /api/auth/send-otp/route.ts for context.
export async function POST() {
  return Response.json({ error: "This sign-in method is no longer available." }, { status: 410 });
}
