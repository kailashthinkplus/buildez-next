import { NextRequest, NextResponse } from "next/server";

import { firstForwardedIp, resolveConsentRegion } from "@/lib/geo/consentRegion";

export async function GET(req: NextRequest) {
  const ip = firstForwardedIp(req.headers.get("x-forwarded-for"), req.headers.get("x-real-ip"));
  const region = resolveConsentRegion(ip);
  return NextResponse.json({ region }, { headers: { "Cache-Control": "private, max-age=0, no-store" } });
}
