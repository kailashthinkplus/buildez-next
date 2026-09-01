import { NextRequest } from "next/server";

import { prisma } from "@buildez/db";
import { getUser } from "@/lib/auth/getUser";
import { dodoClient } from "@/lib/billing/dodo";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant || !auth.permissions.manageBilling) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const subscription = await prisma.subscription.findFirst({
    where: { tenantActiveId: auth.tenant.id, dodoCustomerId: { not: null } },
    select: { dodoCustomerId: true },
  });
  if (!subscription?.dodoCustomerId) {
    return Response.json({ error: "No billing account is connected yet." }, { status: 404 });
  }
  try {
    const session = await dodoClient().customers.customerPortal.create(subscription.dodoCustomerId, {
      return_url: `${req.nextUrl.origin}/app/workspace/billing`,
    });
    return Response.json({ portalUrl: session.link });
  } catch (error) {
    console.error("Billing portal failed:", error);
    return Response.json({ error: "Billing portal could not be opened." }, { status: 502 });
  }
}
