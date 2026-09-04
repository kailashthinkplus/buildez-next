import { prisma } from "@buildez/db";

export async function customDomainEntitlement(tenantId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { tenantActiveId: tenantId, status: "ACTIVE" },
    select: {
      planCode: true,
      Plan: { select: { features: { where: { key: { in: ["custom_domain", "everything"] } }, select: { key: true, value: true } } } },
    },
  });
  const features = new Map(subscription?.Plan?.features.map((feature) => [feature.key, feature.value.toLowerCase()]));
  return {
    allowed: features.get("custom_domain") === "true" || features.get("everything") === "true",
    planCode: subscription?.planCode || "FREE",
  };
}
