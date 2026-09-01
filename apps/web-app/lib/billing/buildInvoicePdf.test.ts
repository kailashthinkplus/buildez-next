import assert from "node:assert/strict";
import test from "node:test";

import { PDFDocument } from "pdf-lib";

import { buildBuildezInvoicePdf, gstInclusiveBreakdown } from "./buildInvoicePdf";

test("separates 18% GST from a captured GST-inclusive amount", () => {
  assert.deepEqual(gstInclusiveBreakdown(58_882), {
    subtotalMinor: 49_900,
    gstMinor: 8_982,
    totalMinor: 58_882,
  });
});

test("builds a readable one-page BuildEZ payment receipt", async () => {
  const bytes = await buildBuildezInvoicePdf({
    reference: "pay_test_123",
    providerInvoiceId: "inv_test_123",
    tenantName: "Example Workspace",
    description: "STARTER subscription",
    planCode: "STARTER",
    billingCycle: "monthly",
    amountMinor: 58_882,
    currency: "INR",
    paidAt: new Date("2026-08-29T12:00:00.000Z"),
  });

  assert.equal(Buffer.from(bytes.subarray(0, 4)).toString("ascii"), "%PDF");
  assert.ok(bytes.length > 1_000);

  const parsed = await PDFDocument.load(bytes);
  assert.equal(parsed.getPageCount(), 1);
  assert.match(parsed.getTitle() || "", /BuildEZ payment receipt/);
});
