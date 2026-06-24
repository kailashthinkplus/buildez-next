import { NextResponse } from "next/server";
import { db } from "@buildez/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const where: any = {};

    if (searchParams.get("active") === "true") {
      where.active = true;
    }

    if (searchParams.get("public") === "true") {
      where.public = true;
    }

    const plans = await db.plan.findMany({
      where,
      orderBy: {
        priceMonthly: "asc",
      },
      include: {
        pricing: true,
        features: true,
      },
    });

    return NextResponse.json(plans);
  } catch (err) {
    console.error("plans API error", err);
    return NextResponse.json([], { status: 200 });
  }
}
