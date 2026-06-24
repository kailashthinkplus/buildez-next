// packages/db/prisma/seed.cjs

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding BuildEZ plans...");

  const plans = [
    {
      code: "trial",
      name: "Trial",
      description: "Free starter plan",
      tag: "FREE",
      priceMonthly: 0,
      priceYearly: 0,
      features: [
        "1 website",
        "5 pages",
        "20 AI credits",
        "1 team member"
      ],
      isPublic: true,
      isActive: true,
    },
    {
      code: "starter",
      name: "Starter",
      description: "Perfect for individuals",
      tag: "POPULAR",
      priceMonthly: 299,
      priceYearly: 299 * 12 * 0.8, // 20% off yearly
      features: [
        "1 website",
        "50 pages",
        "200 AI credits",
        "3 team members"
      ],
      isPublic: true,
      isActive: true,
    },
    {
      code: "business",
      name: "Business",
      description: "Best for small businesses",
      tag: "BEST VALUE",
      priceMonthly: 799,
      priceYearly: 799 * 12 * 0.8,
      features: [
        "3 websites",
        "Unlimited pages",
        "1000 AI credits",
        "10 team members",
        "Advanced analytics",
      ],
      isPublic: true,
      isActive: true,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
  }

  console.log("✅ Plans seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
