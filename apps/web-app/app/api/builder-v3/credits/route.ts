import { getUser } from "@/lib/auth/getUser";
import { getTenantPlan } from "@/lib/plan/getPlan";
import { getV12CreditBalance } from "@/modules/ai-v12/creditBalance";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const auth = await getUser();

  if (!auth?.user || !auth.tenant) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const tenantPlan =
    await getTenantPlan(auth.tenant.id);

  const creditLimit =
    typeof tenantPlan?.plan?.aiCredits === "number"
      ? tenantPlan.plan.aiCredits
      : 0;

  const balance =
    await getV12CreditBalance({
      tenantId: auth.tenant.id,
      creditLimit,
    });

  return Response.json({
    planCode:
      tenantPlan?.plan?.code ||
      tenantPlan?.subscription?.planCode ||
      null,

    balance,
  });
}
