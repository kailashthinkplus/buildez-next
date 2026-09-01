import { prisma } from "@buildez/db";
import {
  requireSuperAdmin,
  superAdminErrorResponse,
} from "@/lib/superadmin/auth";
import { syncPlanPricingToDodo } from "@/lib/billing/dodo";

async function syncPricingToDodo(
  planName: string,
  pricingRecords: readonly {
    id: string;
    planCode: string;
    billingCycle: string;
    amount: number;
    currency: string;
    dodoProductId: string | null;
  }[],
) {
  const errors: string[] = [];
  for (const pricing of pricingRecords) {
    try {
      await syncPlanPricingToDodo(pricing, planName);
    } catch (error) {
      errors.push(
        `${pricing.billingCycle}: ${error instanceof Error ? error.message : "Dodo sync failed"}`,
      );
    }
  }
  return errors;
}

const V12_FEATURES = {
  "v12.max_auto_repairs": "number",
  "v12.max_concurrency": "number",
  "v12.allow_multipage": "boolean",
  "v12.allow_images": "boolean",
  "v12.allow_video": "boolean",
  "v12.allow_3d": "boolean",
  "v12.allow_figma": "boolean",
  "v12.allow_design_references": "boolean",
  "v12.qa_tier": "string",
  "v12.context_tier": "string",
} as const;

type V12FeatureKey = keyof typeof V12_FEATURES;

function integer(
  value: unknown,
  fallback: number,
  minimum = 0,
) {
  const parsed = Number.parseInt(String(value ?? ""), 10);

  return Number.isFinite(parsed)
    ? Math.max(minimum, parsed)
    : fallback;
}

function price(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Plan prices must be zero or greater");
  }
  return Math.round(parsed);
}

function currency(value: unknown) {
  const normalized = String(value || "INR").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) throw new Error("Use a valid 3-letter currency code");
  return normalized;
}

function normalizeFeatureValue(
  key: V12FeatureKey,
  value: unknown,
) {
  const type = V12_FEATURES[key];

  if (type === "boolean") {
    return String(
      value === true ||
      String(value).trim().toLowerCase() === "true",
    );
  }

  if (type === "number") {
    const parsed = Number.parseInt(String(value ?? ""), 10);

    if (!Number.isFinite(parsed)) {
      throw new Error(`Invalid numeric value for ${key}`);
    }

    return String(Math.max(0, parsed));
  }

  const normalized = String(value ?? "").trim().toUpperCase();

  if (
    key === "v12.qa_tier" &&
    !["BASIC", "STANDARD", "ADVANCED"].includes(normalized)
  ) {
    throw new Error("Invalid QA tier");
  }

  if (
    key === "v12.context_tier" &&
    !["LIMITED", "STANDARD", "EXTENDED"].includes(normalized)
  ) {
    throw new Error("Invalid context tier");
  }

  return normalized;
}

export async function POST(req: Request) {
  try {
    const actor = await requireSuperAdmin(req);
    const body = await req.json();

    const code = String(body.code || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, "_");

    const name = String(body.name || "").trim();

    if (!code || !name) {
      return Response.json(
        { error: "Plan code and name are required" },
        { status: 400 },
      );
    }

    const { plan, pricingRecords } = await prisma.$transaction(async (tx) => {
      const created = await tx.plan.create({
        data: {
          code,
          name,
          maxSites: integer(body.maxSites, 1, 1),
          maxPages: integer(body.maxPages, 5, 1),
          aiCredits: integer(body.aiCredits, 100, 0),
          teamMembers: integer(body.teamMembers, 1, 1),
          isPublic: body.isPublic !== false,
        },
      });

      const planCurrency = currency(body.currency);
      const monthly = price(body.priceMonthly);
      const yearly = price(body.priceYearly);

      const pricingRecords = [];
      for (const [billingCycle, amount] of [["monthly", monthly], ["yearly", yearly]] as const) {
        if (amount === undefined) continue;
        pricingRecords.push(
          await tx.planPricing.create({
            data: { planCode: code, billingCycle, amount, currency: planCurrency },
          }),
        );
      }

      if (
        body.v12Features &&
        typeof body.v12Features === "object"
      ) {
        for (
          const [rawKey, rawValue]
          of Object.entries(
            body.v12Features as Record<string, unknown>,
          )
        ) {
          if (!(rawKey in V12_FEATURES)) continue;

          const key = rawKey as V12FeatureKey;

          await tx.planFeature.create({
            data: {
              planCode: code,
              key,
              value: normalizeFeatureValue(key, rawValue),
              type: V12_FEATURES[key],
            },
          });
        }
      }

      return { plan: created, pricingRecords };
    });

    const dodoSyncErrors = await syncPricingToDodo(name, pricingRecords);

    await prisma.systemNotification.create({
      data: {
        type: "SUPERADMIN_PLAN_CREATE",
        title: "Plan created",
        message: `${actor.email || actor.id} created ${code}`,
        entityType: "Plan",
        entityId: plan.id,
      },
    });

    const hydrated = await prisma.plan.findUnique({
      where: { code },
      include: {
        pricing: true,
        features: true,
      },
    });

    return Response.json(
      { plan: hydrated, ...(dodoSyncErrors.length ? { dodoSyncErrors } : {}) },
      { status: 201 },
    );
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);

    const plans = await prisma.plan.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        pricing: true,
        features: true,
        _count: {
          select: {
            subscriptions: true,
            siteSubscriptions: true,
          },
        },
      },
    });

    return Response.json({ plans });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const actor = await requireSuperAdmin(req);
    const body = await req.json().catch(() => ({}));

    const code = String(body.code || "")
      .trim()
      .toUpperCase();

    if (!code) {
      return Response.json(
        { error: "Plan code is required" },
        { status: 400 },
      );
    }

    const existing = await prisma.plan.findUnique({
      where: { code },
      include: {
        _count: { select: { subscriptions: true, siteSubscriptions: true } },
      },
    });

    if (!existing) {
      return Response.json(
        { error: "Plan not found" },
        { status: 404 },
      );
    }

    if (existing._count.subscriptions > 0 || existing._count.siteSubscriptions > 0) {
      return Response.json(
        { error: "This plan has active subscriptions and cannot be deleted. Unpublish it instead." },
        { status: 409 },
      );
    }

    await prisma.$transaction([
      prisma.planFeature.deleteMany({ where: { planCode: code } }),
      prisma.planPricing.deleteMany({ where: { planCode: code } }),
      prisma.plan.delete({ where: { code } }),
    ]);

    await prisma.systemNotification.create({
      data: {
        type: "SUPERADMIN_PLAN_DELETE",
        title: "Plan deleted",
        message: `${actor.email || actor.id} deleted ${code}`,
        entityType: "Plan",
        entityId: existing.id,
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const actor = await requireSuperAdmin(req);
    const body = await req.json();

    const code = String(body.code || "")
      .trim()
      .toUpperCase();

    if (!code) {
      return Response.json(
        { error: "Plan code is required" },
        { status: 400 },
      );
    }

    const existing = await prisma.plan.findUnique({
      where: { code },
    });

    if (!existing) {
      return Response.json(
        { error: "Plan not found" },
        { status: 404 },
      );
    }

    const data: Record<string, unknown> = {};

    if (typeof body.name === "string" && body.name.trim()) {
      data.name = body.name.trim();
    }

    if (body.maxSites !== undefined) {
      data.maxSites = integer(
        body.maxSites,
        existing.maxSites,
        1,
      );
    }

    if (body.maxPages !== undefined) {
      data.maxPages = integer(
        body.maxPages,
        existing.maxPages,
        1,
      );
    }

    if (body.aiCredits !== undefined) {
      data.aiCredits = integer(
        body.aiCredits,
        existing.aiCredits,
        0,
      );
    }

    if (body.teamMembers !== undefined) {
      data.teamMembers = integer(
        body.teamMembers,
        existing.teamMembers,
        1,
      );
    }

    if (typeof body.isPublic === "boolean") {
      data.isPublic = body.isPublic;
    }

    const pricingRecords = await prisma.$transaction(async (tx) => {
      if (Object.keys(data).length) {
        await tx.plan.update({
          where: { code },
          data,
        });
      }

      const planCurrency = currency(body.currency);
      const prices = [
        ["monthly", price(body.priceMonthly)],
        ["yearly", price(body.priceYearly)],
      ] as const;

      const pricingRecords = [];
      for (const [billingCycle, amount] of prices) {
        if (amount === undefined) continue;
        pricingRecords.push(
          await tx.planPricing.upsert({
            where: { planCode_billingCycle: { planCode: code, billingCycle } },
            update: { amount, currency: planCurrency, isActive: true },
            create: { planCode: code, billingCycle, amount, currency: planCurrency },
          }),
        );
      }

      if (
        body.v12Features &&
        typeof body.v12Features === "object"
      ) {
        const features =
          body.v12Features as Record<string, unknown>;

        for (
          const [rawKey, rawValue]
          of Object.entries(features)
        ) {
          if (!(rawKey in V12_FEATURES)) continue;

          const key = rawKey as V12FeatureKey;

          await tx.planFeature.upsert({
            where: {
              planCode_key: {
                planCode: code,
                key,
              },
            },
            update: {
              value: normalizeFeatureValue(
                key,
                rawValue,
              ),
              type: V12_FEATURES[key],
            },
            create: {
              planCode: code,
              key,
              value: normalizeFeatureValue(
                key,
                rawValue,
              ),
              type: V12_FEATURES[key],
            },
          });
        }
      }

      return pricingRecords;
    });

    const planName = typeof data.name === "string" ? data.name : existing.name;
    const dodoSyncErrors = await syncPricingToDodo(planName, pricingRecords);

    const plan = await prisma.plan.findUnique({
      where: { code },
      include: {
        pricing: true,
        features: true,
        _count: {
          select: {
            subscriptions: true,
            siteSubscriptions: true,
          },
        },
      },
    });

    await prisma.systemNotification.create({
      data: {
        type: "SUPERADMIN_PLAN_UPDATE",
        title: "Plan updated",
        message:
          `${actor.email || actor.id} updated ${code}`,
        entityType: "Plan",
        entityId: existing.id,
      },
    });

    return Response.json({ plan, ...(dodoSyncErrors.length ? { dodoSyncErrors } : {}) });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}
