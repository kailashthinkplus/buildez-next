import { readFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@buildez/db";
import sharp from "sharp";

import { getUser } from "@/lib/auth/getUser";
import { buildBuildezInvoicePdf } from "@/lib/billing/buildInvoicePdf";

export const runtime = "nodejs";

function metadataRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

async function loadBuildezLogo() {
  try {
    const logoPath = path.join(process.cwd(), "public", "buildez-logo-light.svg");
    const svg = await readFile(logoPath);
    return new Uint8Array(await sharp(svg).resize({ width: 440 }).png().toBuffer());
  } catch {
    // Keep receipt downloads available through the builder's text fallback if
    // the optional image asset cannot be read or converted.
    return undefined;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ transactionId: string }> },
) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { transactionId } = await params;
  const transaction = await prisma.billingTransaction.findFirst({
    where: {
      id: transactionId,
      tenantId: auth.tenant.id,
      status: "SUCCEEDED",
    },
    select: {
      providerPaymentId: true,
      type: true,
      amountMinor: true,
      currency: true,
      planCode: true,
      billingCycle: true,
      paidAt: true,
      createdAt: true,
      metadata: true,
    },
  });

  if (!transaction) {
    return Response.json({ error: "Paid transaction not found" }, { status: 404 });
  }

  const metadata = metadataRecord(transaction.metadata);
  const packName = typeof metadata.packName === "string" ? metadata.packName : null;
  const providerInvoiceId = typeof metadata.invoiceId === "string" ? metadata.invoiceId : null;
  const description = transaction.type === "CREDIT_TOP_UP"
    ? packName || "AI credit top-up"
    : transaction.planCode
      ? `${transaction.planCode} subscription`
      : "Subscription payment";

  const pdf = await buildBuildezInvoicePdf({
    reference: transaction.providerPaymentId,
    providerInvoiceId,
    tenantName: auth.tenant.name || "BuildEZ workspace",
    description,
    planCode: transaction.planCode,
    billingCycle: transaction.billingCycle,
    amountMinor: transaction.amountMinor,
    currency: transaction.currency,
    paidAt: transaction.paidAt || transaction.createdAt,
    logoPng: await loadBuildezLogo(),
  });

  const safeReference = transaction.providerPaymentId.replace(/[^a-zA-Z0-9_-]/g, "-");
  return new Response(Buffer.from(pdf), {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="buildez-receipt-${safeReference}.pdf"`,
    },
  });
}
