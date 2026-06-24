/* eslint-disable */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding BuildEZ plans...");

  const plans = [
    {
      code: "trial",
      name: "Trial",
      limits: {
        maxSites: 1,
        maxPages: 5,
        aiCredits: 20,
        teamMembers: 1,
      },
      pricing: [], // free
      features: [
        { key: "maxSites", value: "1", type: "number" },
        { key: "maxPages", value: "5", type: "number" },
        { key: "aiCredits", value: "20", type: "number" },
        { key: "teamMembers", value: "1", type: "number" },
      ],
    },

    {
      code: "starter",
      name: "Starter",
      limits: {
        maxSites: 3,
        maxPages: 50,
        aiCredits: 500,
        teamMembers: 5,
      },
      pricing: [
        { billingCycle: "monthly", currency: "INR", amount: 2999 },
        { billingCycle: "yearly", currency: "INR", amount: 19999 },
      ],
      features: [
        { key: "maxSites", value: "3", type: "number" },
        { key: "maxPages", value: "50", type: "number" },
        { key: "aiCredits", value: "500", type: "number" },
        { key: "teamMembers", value: "5", type: "number" },
        { key: "prioritySupport", value: "true", type: "boolean" },
      ],
    },

    {
      code: "pro",
      name: "Pro",
      limits: {
        maxSites: 50,
        maxPages: 1000,
        aiCredits: 5000,
        teamMembers: 20,
      },
      pricing: [
        { billingCycle: "monthly", currency: "INR", amount: 4999 },
        { billingCycle: "yearly", currency: "INR", amount: 49999 },
      ],
      features: [
        { key: "maxSites", value: "50", type: "number" },
        { key: "maxPages", value: "1000", type: "number" },
        { key: "aiCredits", value: "5000", type: "number" },
        { key: "teamMembers", value: "20", type: "number" },
        { key: "dedicatedManager", value: "true", type: "boolean" },
        { key: "advancedAnalytics", value: "true", type: "boolean" },
      ],
    },
  ];

  for (const p of plans) {
    console.log(`➡️ Upserting plan: ${p.code}`);

    // Create/update base plan
    await prisma.plan.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        maxSites: p.limits.maxSites,
        maxPages: p.limits.maxPages,
        aiCredits: p.limits.aiCredits,
        teamMembers: p.limits.teamMembers,
        isPublic: true,
      },
      create: {
        code: p.code,
        name: p.name,
        maxSites: p.limits.maxSites,
        maxPages: p.limits.maxPages,
        aiCredits: p.limits.aiCredits,
        teamMembers: p.limits.teamMembers,
        isPublic: true,
      },
    });

    // Clear old relations
    await prisma.planPricing.deleteMany({ where: { planCode: p.code } });
    await prisma.planFeature.deleteMany({ where: { planCode: p.code } });

    // Insert pricing rows
    for (const pr of p.pricing) {
      await prisma.planPricing.create({
        data: {
          planCode: p.code,
          billingCycle: pr.billingCycle,
          currency: pr.currency,
          amount: pr.amount,
        },
      });
    }

    // Insert feature rows
    for (const f of p.features) {
      await prisma.planFeature.create({
        data: {
          planCode: p.code,
          key: f.key,
          value: f.value,
          type: f.type,
        },
      });
    }
  }

  console.log("✅ BuildEZ Plans seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
