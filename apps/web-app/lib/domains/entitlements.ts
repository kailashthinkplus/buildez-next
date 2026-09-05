import { prisma } from "@buildez/db";
import { computeTrialStatus } from "@/lib/plan/trial";

export async function customDomainEntitlement(tenantId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { tenantActiveId: tenantId, status: "ACTIVE" },
    select: {
      planCode: true,
      startedAt: true,
      trialEndsAt: true,
      Plan: {
        select: {
          trialDays: true,
          features: { where: { key: { in: ["custom_domain", "everything"] } }, select: { key: true, value: true } },
        },
      },
    },
  });
  const trial = computeTrialStatus(subscription?.Plan, subscription);
  const features = new Map(subscription?.Plan?.features.map((feature) => [feature.key, feature.value.toLowerCase()]));
  return {
    allowed:
      !trial.expired &&
      (features.get("custom_domain") === "true" || features.get("everything") === "true"),
    planCode: subscription?.planCode || "FREE",
  };
}
