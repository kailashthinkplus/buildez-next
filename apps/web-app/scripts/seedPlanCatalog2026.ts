/**
 * Idempotent seed for the 2026 plan catalog (NEW customers only).
 *
 * Safe to run repeatedly:
 *  - Plan/PlanPricing/PlanFeature rows are upserted by their natural keys.
 *  - Dodo products are created once (syncPlanPricingToDodo only creates when
 *    `dodoProductId` is still empty; a second run just re-syncs the price on
 *    the existing product).
 *  - Never touches Subscription rows, never resets credits, never repoints
 *    legacy Dodo product ids.
 *  - The legacy-plan visibility flip only ever sets `isPublic: false` — no
 *    other legacy field is written.
 *
 * Run from apps/web-app:
 *   node --import tsx scripts/seedPlanCatalog2026.ts
 */

import { prisma } from "@buildez/db";
import { syncPlanPricingToDodo } from "@/lib/billing/dodo";

const LEGACY_PLAN_CODES = ["FREE", "STARTER", "PRO", "BUSINESS", "AGENCY", "ENTERPRISE"];

// v12.* generation policy is deliberately IDENTICAL across every 2026 plan —
// launch strategy is to let every new customer fully trial AI generation
// capabilities regardless of tier. Plans differ only by sites/pages/credits/
// team seats (below) and by commercial/collaboration features.
const SHARED_V12_FEATURES: ReadonlyArray<readonly [string, string, string]> = [
  ["v12.max_auto_repairs", "3", "number"],
  ["v12.max_concurrency", "2", "number"],
  ["v12.allow_multipage", "true", "boolean"],
  ["v12.allow_images", "true", "boolean"],
  ["v12.allow_video", "true", "boolean"],
  ["v12.allow_3d", "true", "boolean"],
  ["v12.allow_figma", "true", "boolean"],
  ["v12.allow_design_references", "true", "boolean"],
  ["v12.qa_tier", "STANDARD", "string"],
  ["v12.context_tier", "STANDARD", "string"],
];

type PlanSeed = {
  code: string;
  name: string;
  maxSites: number;
  maxPages: number;
  aiCredits: number;
  teamMembers: number;
  trialDays: number | null;
  displayOrder: number;
  badge: string | null;
  eyebrow: string;
  summary: string;
  commercialFeatures: ReadonlyArray<readonly [string, string]>;
  pricing: ReadonlyArray<{ billingCycle: "monthly" | "yearly" | "custom"; amount: number }>;
  dodoProductNames?: { monthly: string; yearly: string };
};

const CURRENCY = "INR";

const PLANS: PlanSeed[] = [
  {
    code: "FREE_2026",
    name: "Free",
    maxSites: 1,
    maxPages: 5,
    aiCredits: 500,
    teamMembers: 1,
    trialDays: 30,
    displayOrder: 0,
    badge: null,
    eyebrow: "Experience BuildEZ",
    summary:
      "Create your first AI website and try the full toolkit free for 30 days.",
    commercialFeatures: [
      ["ai_builder", "true"],
      ["custom_domain", "false"],
      ["analytics", "false"],
    ],
    pricing: [{ billingCycle: "monthly", amount: 0 }],
  },
  {
    code: "STARTER_2026",
    name: "Starter",
    maxSites: 3,
    maxPages: 30,
    aiCredits: 1500,
    teamMembers: 1,
    trialDays: null,
    displayOrder: 1,
    badge: null,
    eyebrow: "Build and publish professionally",
    summary:
      "Publish real, multi-page websites with your own domain and AI-generated content.",
    commercialFeatures: [
      ["ai_builder", "true"],
      ["custom_domain", "true"],
      ["ssl", "true"],
      ["analytics", "true"],
      ["forms", "true"],
    ],
    pricing: [
      { billingCycle: "monthly", amount: 1999 },
      { billingCycle: "yearly", amount: 19990 },
    ],
    dodoProductNames: { monthly: "BuildEZ Starter Monthly 2026", yearly: "BuildEZ Starter Annual 2026" },
  },
  {
    code: "PROFESSIONAL_2026",
    name: "Professional",
    maxSites: 10,
    maxPages: 150,
    aiCredits: 5000,
    teamMembers: 3,
    trialDays: null,
    displayOrder: 2,
    badge: "MOST POPULAR",
    eyebrow: "Your AI website production workspace",
    summary:
      "Generate and manage multiple client websites with more AI capacity and priority workflows.",
    commercialFeatures: [
      ["ai_builder", "true"],
      ["custom_domain", "true"],
      ["ssl", "true"],
      ["analytics", "true"],
      ["forms", "true"],
      ["blog", "true"],
      ["team", "true"],
    ],
    pricing: [
      { billingCycle: "monthly", amount: 4999 },
      { billingCycle: "yearly", amount: 49990 },
    ],
    dodoProductNames: { monthly: "BuildEZ Professional Monthly 2026", yearly: "BuildEZ Professional Annual 2026" },
  },
  {
    code: "BUSINESS_2026",
    name: "Business",
    maxSites: 30,
    maxPages: 600,
    aiCredits: 15000,
    teamMembers: 10,
    trialDays: null,
    displayOrder: 3,
    badge: null,
    eyebrow: "Run your web business on BuildEZ",
    summary:
      "Run high-volume website production with team collaboration, leads and analytics.",
    commercialFeatures: [
      ["ai_builder", "true"],
      ["custom_domain", "true"],
      ["ssl", "true"],
      ["analytics", "true"],
      ["forms", "true"],
      ["blog", "true"],
      ["team", "true"],
      ["api", "true"],
      ["white_label", "true"],
      ["priority_support", "true"],
    ],
    pricing: [
      { billingCycle: "monthly", amount: 14999 },
      { billingCycle: "yearly", amount: 149990 },
    ],
    dodoProductNames: { monthly: "BuildEZ Business Monthly 2026", yearly: "BuildEZ Business Annual 2026" },
  },
  {
    code: "AGENCY_2026",
    name: "Agency",
    maxSites: 100,
    maxPages: 2500,
    aiCredits: 50000,
    teamMembers: 25,
    trialDays: null,
    displayOrder: 4,
    badge: null,
    eyebrow: "Scale website production",
    summary:
      "Scale website production across clients with a larger team and higher limits.",
    commercialFeatures: [
      ["ai_builder", "true"],
      ["custom_domain", "true"],
      ["ssl", "true"],
      ["analytics", "true"],
      ["forms", "true"],
      ["blog", "true"],
      ["team", "true"],
      ["api", "true"],
      ["white_label", "true"],
      ["priority_support", "true"],
      ["agency_workspace", "true"],
    ],
    pricing: [
      { billingCycle: "monthly", amount: 39999 },
      { billingCycle: "yearly", amount: 399990 },
    ],
    dodoProductNames: { monthly: "BuildEZ Agency Monthly 2026", yearly: "BuildEZ Agency Annual 2026" },
  },
  {
    code: "ENTERPRISE_2026",
    name: "Enterprise",
    // Generous internal ceilings, never shown to customers as raw numbers —
    // the "custom" pricing row below drives the UI to show "Custom"/"Contact
    // Sales" instead.
    maxSites: 250,
    maxPages: 50000,
    aiCredits: 250000,
    teamMembers: 250,
    trialDays: null,
    displayOrder: 5,
    badge: null,
    eyebrow: "BuildEZ at organisational scale",
    summary:
      "Custom AI capacity, infrastructure and support for organisation-scale deployments.",
    commercialFeatures: [
      ["everything", "true"],
      ["custom_limits", "true"],
      ["dedicated_support", "true"],
    ],
    pricing: [{ billingCycle: "custom", amount: 0 }],
  },
];

async function upsertPlan(seed: PlanSeed) {
  await prisma.plan.upsert({
    where: { code: seed.code },
    update: {
      name: seed.name,
      maxSites: seed.maxSites,
      maxPages: seed.maxPages,
      aiCredits: seed.aiCredits,
      teamMembers: seed.teamMembers,
      trialDays: seed.trialDays,
      displayOrder: seed.displayOrder,
      badge: seed.badge,
      eyebrow: seed.eyebrow,
      summary: seed.summary,
      catalogVersion: "2026",
      isPublic: true,
    },
    create: {
      code: seed.code,
      name: seed.name,
      maxSites: seed.maxSites,
      maxPages: seed.maxPages,
      aiCredits: seed.aiCredits,
      teamMembers: seed.teamMembers,
      trialDays: seed.trialDays,
      displayOrder: seed.displayOrder,
      badge: seed.badge,
      eyebrow: seed.eyebrow,
      summary: seed.summary,
      catalogVersion: "2026",
      isPublic: true,
    },
  });

  for (const price of seed.pricing) {
    await prisma.planPricing.upsert({
      where: { planCode_billingCycle: { planCode: seed.code, billingCycle: price.billingCycle } },
      update: { amount: price.amount, currency: CURRENCY, isActive: true },
      create: { planCode: seed.code, billingCycle: price.billingCycle, currency: CURRENCY, amount: price.amount, isActive: true },
    });
  }

  const allFeatures: ReadonlyArray<readonly [string, string, string]> = [
    ...SHARED_V12_FEATURES,
    ...seed.commercialFeatures.map(([key, value]) => [key, value, "boolean"] as const),
  ];

  for (const [key, value, type] of allFeatures) {
    await prisma.planFeature.upsert({
      where: { planCode_key: { planCode: seed.code, key } },
      update: { value, type },
      create: { planCode: seed.code, key, value, type },
    });
  }
}

async function syncDodoProducts(seed: PlanSeed) {
  if (!seed.dodoProductNames) return [] as string[];

  const pricingRows = await prisma.planPricing.findMany({
    where: { planCode: seed.code, billingCycle: { in: ["monthly", "yearly"] } },
  });

  const errors: string[] = [];
  for (const pricing of pricingRows) {
    const productName =
      pricing.billingCycle === "monthly" ? seed.dodoProductNames.monthly : seed.dodoProductNames.yearly;
    try {
      const productId = await syncPlanPricingToDodo(pricing, seed.name, productName);
      console.log(`  Dodo product [${seed.code}:${pricing.billingCycle}] -> ${productId}`);
    } catch (error) {
      errors.push(`${seed.code}:${pricing.billingCycle}: ${error instanceof Error ? error.message : "sync failed"}`);
    }
  }
  return errors;
}

async function main() {
  console.log("=====================================");
  console.log("BuildEZ 2026 plan catalog seed");
  console.log("=====================================");

  for (const seed of PLANS) {
    console.log(`\nUpserting ${seed.code}...`);
    await upsertPlan(seed);
  }

  console.log("\nSyncing Dodo products for paid 2026 plans...");
  const allErrors: string[] = [];
  for (const seed of PLANS) {
    const errors = await syncDodoProducts(seed);
    allErrors.push(...errors);
  }

  console.log("\nHiding legacy plans from the public catalog (isPublic only — no other field touched)...");
  const hidden = await prisma.plan.updateMany({
    where: { code: { in: LEGACY_PLAN_CODES } },
    data: { isPublic: false },
  });
  console.log(`  ${hidden.count} legacy plan(s) hidden from new signups.`);

  console.log("\n=====================================");
  if (allErrors.length) {
    console.log("Completed with Dodo sync errors:");
    allErrors.forEach((error) => console.log(`  - ${error}`));
  } else {
    console.log("2026 plan catalog seed complete.");
  }
  console.log("=====================================");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
