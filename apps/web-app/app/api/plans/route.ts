// /app/api/plans/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";

export async function GET(req: Request) {
  console.log("--------------------------------------------------");
  console.log("[/api/plans] HIT");
  console.log("[/api/plans] URL:", req.url);

  try {
    const url = new URL(req.url);
    const onlyActive = url.searchParams.get("active");
    const onlyPublic = url.searchParams.get("public");

    console.log("[/api/plans] Query Params:", { onlyActive, onlyPublic });

    const plans = await prisma.plan.findMany({
      where: {
        isPublic: onlyPublic === "true",
      },
      include: {
        pricing: {
          where: { isActive: true },
          orderBy: { billingCycle: "asc" },
        },
        features: true,
      },
      orderBy: { createdAt: "asc" },
    });

    console.log("[/api/plans] Prisma returned:", plans.length, "plans");

    const response = plans.map((p) => ({
      code: p.code,
      name: p.name,
      description: p.description || "",
      tag: p.code === "trial" ? "FREE" : p.code === "pro" ? "BEST" : null,

      maxSites: p.maxSites,
      maxPages: p.maxPages,
      aiCredits: p.aiCredits,
      teamMembers: p.teamMembers,

      priceMonthly:
        p.pricing.find((pr) => pr.billingCycle === "monthly")?.amount || 0,
      priceYearly:
        p.pricing.find((pr) => pr.billingCycle === "yearly")?.amount || 0,

      features: p.features.map((f) => {
        if (f.type === "boolean") {
          return f.key.replace(/([A-Z])/g, " $1").trim();
        }
        return `${f.key}: ${f.value}`;
      }),
    }));

    console.log("[/api/plans] Returning to client:", response.length);

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    console.error("[/api/plans] ERROR:", err);
    return NextResponse.json(
      { error: "Server error", detail: err?.message },
      { status: 500 }
    );
  }
}
