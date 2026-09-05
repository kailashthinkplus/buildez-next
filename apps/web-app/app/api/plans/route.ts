import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";

import {
  dodoProductId,
  type BillingCycle,
} from "@/lib/billing/dodo";
import { formatPlanFeatures } from "@/lib/billing/planFeatures";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const onlyPublic = url.searchParams.get("public") === "true";

    const plans = await prisma.plan.findMany({
      where: onlyPublic ? { isPublic: true } : undefined,
      include: {
        pricing: {
          where: { isActive: true },
          orderBy: { billingCycle: "asc" },
        },
        features: true,
      },
    });

    const response = plans
      .map((plan) => {
        const pricing = plan.pricing.map((planPrice) => ({
          billingCycle: planPrice.billingCycle,
          currency: planPrice.currency,
          amount: planPrice.amount,
          checkoutEnabled: ["monthly", "yearly"].includes(planPrice.billingCycle)
            ? Boolean(planPrice.dodoProductId) || Boolean(dodoProductId(plan.code, planPrice.billingCycle as BillingCycle))
            : false,
        }));
        const monthly = pricing.find((planPrice) => planPrice.billingCycle === "monthly");
        const yearly = pricing.find((planPrice) => planPrice.billingCycle === "yearly");
        const isCustom = pricing.some((planPrice) => planPrice.billingCycle === "custom");

        const formattedFeatures = formatPlanFeatures(plan.features);

        return {
          id: plan.id,
          code: plan.code,
          name: plan.name,
          eyebrow: plan.eyebrow,
          summary: plan.summary,
          description: plan.summary || `${plan.maxSites} website${plan.maxSites === 1 ? "" : "s"}, ${plan.maxPages} pages and ${plan.aiCredits.toLocaleString()} AI credits`,
          tag: plan.badge,
          popular: Boolean(plan.badge),
          displayOrder: plan.displayOrder,
          isTrial: Boolean(plan.trialDays),
          trialDays: plan.trialDays,
          maxSites: plan.maxSites,
          maxPages: plan.maxPages,
          aiCredits: plan.aiCredits,
          teamMembers: plan.teamMembers,
          pricing,
          priceMonthly: monthly?.amount ?? null,
          priceYearly: yearly?.amount ?? null,
          currency: monthly?.currency ?? yearly?.currency ?? "INR",
          isCustom,
          checkoutEnabled: {
            monthly: monthly?.checkoutEnabled ?? false,
            yearly: yearly?.checkoutEnabled ?? false,
          },
          // The short, card-friendly list — only capabilities this plan
          // actually includes, most differentiating first.
          features: formattedFeatures.filter((feature) => feature.included).map((feature) => feature.value),
          // The full picture, included and excluded alike, for a
          // side-by-side comparison table — never truncated.
          featureTable: formattedFeatures.map((feature) => ({
            key: feature.groupKey,
            label: feature.groupLabel,
            value: feature.value,
            included: feature.included,
            priority: feature.priority,
          })),
        };
      })
      .sort((left, right) => {
        if (left.displayOrder !== right.displayOrder) return left.displayOrder - right.displayOrder;
        const leftPrice = left.priceMonthly ?? left.priceYearly ?? Number.MAX_SAFE_INTEGER;
        const rightPrice = right.priceMonthly ?? right.priceYearly ?? Number.MAX_SAFE_INTEGER;
        return leftPrice - rightPrice;
      });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Unable to load public plans:", error);
    return NextResponse.json(
      { error: "Plans could not be loaded." },
      { status: 500 },
    );
  }
}
