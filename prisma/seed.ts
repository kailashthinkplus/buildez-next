// /packages/db/prisma/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding BuildEZ Plans...");

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
        "1 team member",
      ],
      isPublic: true,
      isActive: true,
    },
    {
      code: "pro",
      name: "Pro",
      description: "Best for professionals and growing teams",
      tag: "PRO",
      priceMonthly: 2999,   // ₹2,999/mo
      priceYearly: 19990,   // ₹19,990/year (~₹1,666/mo)
      features: [
        "5 websites",
        "100 pages",
        "500 AI credits",
        "5 team members",
      ],
      isPublic: true,
      isActive: true,
    },
    {
      code: "business",
      name: "Business",
      description: "For agencies and companies building at scale",
      tag: "BUSINESS",
      priceMonthly: 4999,   // ₹4,999/mo
      priceYearly: 49999,   // ₹49,999/year (~₹4,166/mo)
      features: [
        "20 websites",
        "1000 pages",
        "5000 AI credits",
        "20 team members",
      ],
      isPublic: true,
      isActive: true,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        description: plan.description,
        tag: plan.tag,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        features: plan.features,
        isPublic: plan.isPublic,
        isActive: plan.isActive,
      },
      create: plan,
    });

    console.log(`✔️  Seeded plan: ${plan.code}`);
  }

  console.log("🌿 Plans seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
