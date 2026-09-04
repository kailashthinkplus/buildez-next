import { NextResponse } from "next/server";
import { getRatesFromInr } from "@/lib/currency";

export async function GET() {
  try {
    const rates = await getRatesFromInr();
    return NextResponse.json({ base: "INR", rates });
  } catch {
    return NextResponse.json({ base: "INR", rates: { INR: 1 } });
  }
}
