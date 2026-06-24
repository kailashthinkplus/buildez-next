import { PrismaClient } from "../generated/client";

const prisma = new PrismaClient();

async function seedPlans() {
  console.log("🌱 Seeding Plans...");

  const plans = [
    {
      code: "FREE",
      name: "Free",
      maxSites: 1,
      maxPages: 5,
      aiCredits: 100,
      teamMembers: 1,
      isPublic: true,
      pricing: [
        {
          billingCycle: "monthly",
          currency: "INR",
          amount: 0,
        },
      ],
      features: [
        ["custom_domain", "false"],
        ["analytics", "false"],
        ["ai_builder", "true"],
        ["storage_gb", "1"],
      ],
    },

    {
      code: "STARTER",
      name: "Starter",
      maxSites: 3,
      maxPages: 30,
      aiCredits: 1000,
      teamMembers: 3,
      isPublic: true,
      pricing: [
        {
          billingCycle: "monthly",
          currency: "INR",
          amount: 499,
        },
        {
          billingCycle: "yearly",
          currency: "INR",
          amount: 4990,
        },
      ],
      features: [
        ["custom_domain", "true"],
        ["analytics", "true"],
        ["ai_builder", "true"],
        ["storage_gb", "10"],
        ["ssl", "true"],
      ],
    },

    {
      code: "PRO",
      name: "Professional",
      maxSites: 15,
      maxPages: 300,
      aiCredits: 5000,
      teamMembers: 10,
      isPublic: true,
      pricing: [
        {
          billingCycle: "monthly",
          currency: "INR",
          amount: 1499,
        },
        {
          billingCycle: "yearly",
          currency: "INR",
          amount: 14990,
        },
      ],
      features: [
        ["custom_domain", "true"],
        ["analytics", "true"],
        ["ai_builder", "true"],
        ["storage_gb", "100"],
        ["ssl", "true"],
        ["team", "true"],
        ["forms", "true"],
        ["blog", "true"],
      ],
    },

    {
      code: "BUSINESS",
      name: "Business",
      maxSites: 50,
      maxPages: 9999,
      aiCredits: 20000,
      teamMembers: 50,
      isPublic: true,
      pricing: [
        {
          billingCycle: "monthly",
          currency: "INR",
          amount: 4999,
        },
        {
          billingCycle: "yearly",
          currency: "INR",
          amount: 49990,
        },
      ],
      features: [
        ["custom_domain", "true"],
        ["analytics", "true"],
        ["ai_builder", "true"],
        ["storage_gb", "500"],
        ["ssl", "true"],
        ["team", "true"],
        ["forms", "true"],
        ["blog", "true"],
        ["api", "true"],
        ["white_label", "true"],
        ["priority_support", "true"],
      ],
    },

    {
      code: "ENTERPRISE",
      name: "Enterprise",
      maxSites: 999999,
      maxPages: 999999,
      aiCredits: 999999,
      teamMembers: 999999,
      isPublic: false,
      pricing: [
        {
          billingCycle: "custom",
          currency: "INR",
          amount: 0,
        },
      ],
      features: [
        ["everything", "true"],
      ],
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: {
        code: plan.code,
      },
      update: {
        name: plan.name,
        maxSites: plan.maxSites,
        maxPages: plan.maxPages,
        aiCredits: plan.aiCredits,
        teamMembers: plan.teamMembers,
        isPublic: plan.isPublic,
      },
      create: {
        code: plan.code,
        name: plan.name,
        maxSites: plan.maxSites,
        maxPages: plan.maxPages,
        aiCredits: plan.aiCredits,
        teamMembers: plan.teamMembers,
        isPublic: plan.isPublic,
      },
    });

    for (const price of plan.pricing) {
      await prisma.planPricing.upsert({
        where: {
          planCode_billingCycle: {
            planCode: plan.code,
            billingCycle: price.billingCycle,
          },
        },
        update: {
          amount: price.amount,
          currency: price.currency,
          isActive: true,
        },
        create: {
          planCode: plan.code,
          billingCycle: price.billingCycle,
          currency: price.currency,
          amount: price.amount,
          isActive: true,
        },
      });
    }

    for (const feature of plan.features) {
      await prisma.planFeature.upsert({
        where: {
          planCode_key: {
            planCode: plan.code,
            key: feature[0],
          },
        },
        update: {
          value: feature[1],
          type: "boolean",
        },
        create: {
          planCode: plan.code,
          key: feature[0],
          value: feature[1],
          type: "boolean",
        },
      });
    }
  }

  console.log("✅ Plans Seeded");
}

async function seedSuperAdmin() {
  console.log("🌱 Seeding Super Admin...");

  const bcrypt = await import("bcryptjs");

  const passwordHash = await bcrypt.hash("Admin@123", 12);

  await prisma.user.upsert({
    where: {
      email: "admin@buildez.ai",
    },
    update: {},
    create: {
      email: "admin@buildez.ai",
      name: "BuildEZ Super Admin",
      role: "SUPER_ADMIN",
      passwordHash,
      isEmailVerified: true,
      isActive: true,
    },
  });

  console.log("✅ Super Admin Seeded");
}

async function main() {
  console.log("=====================================");
  console.log("🚀 BuildEZ Database Seed");
  console.log("=====================================");

  await seedPlans();
  await seedSuperAdmin();

  console.log("");
  console.log("=====================================");
  console.log("✅ Database Seed Complete");
  console.log("=====================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });