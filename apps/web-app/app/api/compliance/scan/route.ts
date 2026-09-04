import { NextResponse } from "next/server";
import { db } from "@buildez/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const where: any = {};

    if (searchParams.get("active") === "true") {
      where.pricing = { some: { isActive: true } };
    }

    if (searchParams.get("public") === "true") {
      where.isPublic = true;
    }

    const plans = await db.plan.findMany({
      where,
      include: {
        pricing: true,
        features: true,
      },
    });

    plans.sort((left, right) =>
      Math.min(...left.pricing.map((item) => item.amount), Number.MAX_SAFE_INTEGER) -
      Math.min(...right.pricing.map((item) => item.amount), Number.MAX_SAFE_INTEGER)
    );

    return NextResponse.json(plans);
  } catch (err) {
    console.error("plans API error", err);
    return NextResponse.json([], { status: 200 });
  }
}
