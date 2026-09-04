import { NextRequest, NextResponse } from "next/server";
import { currencyForCountry, getRatesFromInr } from "@/lib/currency";

export async function GET(req: NextRequest) {
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    req.nextUrl.searchParams.get("country");

  const currency = currencyForCountry(country);

  if (!currency || currency === "INR") {
    return NextResponse.json({ country: country || null, currency: "INR", rate: 1 });
  }

  try {
    const rates = await getRatesFromInr();
    const rate = rates[currency];
    if (!rate) return NextResponse.json({ country, currency: "INR", rate: 1 });
    return NextResponse.json({ country, currency, rate });
  } catch {
    return NextResponse.json({ country, currency: "INR", rate: 1 });
  }
}
