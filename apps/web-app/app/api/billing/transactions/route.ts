import { NextRequest } from "next/server";

import { prisma } from "@buildez/db";
import { getUser } from "@/lib/auth/getUser";

function metadataRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export async function GET(req: NextRequest) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = Math.min(100, Math.max(10, Number(req.nextUrl.searchParams.get("limit")) || 50));
  const transactions = await prisma.billingTransaction.findMany({
    where: { tenantId: auth.tenant.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const rows = transactions.map((item) => {
      const metadata = metadataRecord(item.metadata);
      return {
        id: item.id,
        reference: item.providerPaymentId,
        description: item.type === "CREDIT_TOP_UP"
          ? (typeof metadata.packName === "string" ? metadata.packName : "AI credit top-up")
          : item.planCode ? `${item.planCode} subscription` : "Subscription payment",
        planCode: item.planCode,
        billingCycle: item.billingCycle,
        amountMinor: item.amountMinor,
        currency: item.currency,
        status: item.status,
        paidAt: item.paidAt,
        createdAt: item.createdAt,
        invoiceUrl: item.status === "SUCCEEDED"
          ? `/api/billing/transactions/${encodeURIComponent(item.id)}/invoice`
          : null,
      };
    });

  return Response.json({ transactions: rows });
}
