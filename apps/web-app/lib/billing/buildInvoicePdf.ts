import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFImage,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "PYG", "RWF",
  "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
]);
const GST_PERCENT = 18;

export function gstInclusiveBreakdown(amountMinor: number) {
  const subtotalMinor = Math.round(amountMinor / (1 + GST_PERCENT / 100));
  return {
    subtotalMinor,
    gstMinor: amountMinor - subtotalMinor,
    totalMinor: amountMinor,
  };
}

export type BuildezInvoiceInput = {
  reference: string;
  providerInvoiceId?: string | null;
  tenantName: string;
  description: string;
  planCode?: string | null;
  billingCycle?: string | null;
  amountMinor: number;
  currency: string;
  paidAt: Date;
  logoPng?: Uint8Array;
};

function safeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "?")
    .trim();
}

function money(amountMinor: number, currency: string) {
  const code = currency.toUpperCase();
  const scale = ZERO_DECIMAL_CURRENCIES.has(code) ? 1 : 100;
  return `${code} ${(amountMinor / scale).toLocaleString("en-IN", {
    minimumFractionDigits: scale === 1 ? 0 : 2,
    maximumFractionDigits: scale === 1 ? 0 : 2,
  })}`;
}

function labelValue(input: {
  page: PDFPage;
  regular: PDFFont;
  bold: PDFFont;
  label: string;
  value: string;
  x: number;
  y: number;
}) {
  input.page.drawText(input.label.toUpperCase(), {
    x: input.x,
    y: input.y,
    size: 8,
    font: input.bold,
    color: rgb(0.39, 0.45, 0.55),
  });
  input.page.drawText(safeText(input.value) || "-", {
    x: input.x,
    y: input.y - 18,
    size: 11,
    font: input.regular,
    color: rgb(0.08, 0.12, 0.2),
  });
}

function drawLogo(page: PDFPage, logo: PDFImage | undefined, bold: PDFFont) {
  if (!logo) {
    page.drawText("BuildEZ", {
      x: 48,
      y: 770,
      size: 25,
      font: bold,
      color: rgb(0.075, 0.286, 0.64),
    });
    return;
  }
  const ratio = Math.min(180 / logo.width, 54 / logo.height);
  page.drawImage(logo, {
    x: 48,
    y: 748,
    width: logo.width * ratio,
    height: logo.height * ratio,
  });
}

export async function buildBuildezInvoicePdf(input: BuildezInvoiceInput) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`BuildEZ payment receipt ${safeText(input.reference)}`);
  pdf.setAuthor("BuildEZ");
  pdf.setSubject("Payment receipt");

  const page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = input.logoPng ? await pdf.embedPng(input.logoPng) : undefined;
  const tax = gstInclusiveBreakdown(input.amountMinor);

  page.drawRectangle({
    x: 0,
    y: 716,
    width: 595.28,
    height: 125.89,
    color: rgb(0.955, 0.975, 1),
  });
  page.drawRectangle({
    x: 0,
    y: 716,
    width: 8,
    height: 125.89,
    color: rgb(0.075, 0.286, 0.64),
  });
  drawLogo(page, logo, bold);
  page.drawText("Parent company: Appwire LLP", {
    x: 48,
    y: 730,
    size: 8.5,
    font: regular,
    color: rgb(0.39, 0.45, 0.55),
  });
  page.drawText("PAYMENT RECEIPT", {
    x: 406,
    y: 777,
    size: 10,
    font: bold,
    color: rgb(0.075, 0.286, 0.64),
  });
  page.drawText("PAID", {
    x: 458,
    y: 748,
    size: 20,
    font: bold,
    color: rgb(0.02, 0.55, 0.34),
  });

  page.drawText("Total paid (including 18% GST)", {
    x: 48,
    y: 658,
    size: 10,
    font: bold,
    color: rgb(0.39, 0.45, 0.55),
  });
  page.drawText(money(input.amountMinor, input.currency), {
    x: 48,
    y: 618,
    size: 30,
    font: bold,
    color: rgb(0.04, 0.1, 0.2),
  });
  page.drawText(`Paid on ${input.paidAt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`, {
    x: 48,
    y: 592,
    size: 10,
    font: regular,
    color: rgb(0.39, 0.45, 0.55),
  });

  labelValue({
    page,
    regular,
    bold,
    label: "Subtotal",
    value: money(tax.subtotalMinor, input.currency),
    x: 354,
    y: 662,
  });
  labelValue({
    page,
    regular,
    bold,
    label: `GST (${GST_PERCENT}%)`,
    value: money(tax.gstMinor, input.currency),
    x: 462,
    y: 662,
  });

  page.drawRectangle({
    x: 48,
    y: 533,
    width: 499,
    height: 1,
    color: rgb(0.86, 0.89, 0.93),
  });
  labelValue({ page, regular, bold, label: "Billed to", value: input.tenantName, x: 48, y: 500 });
  labelValue({ page, regular, bold, label: "Description", value: input.description, x: 300, y: 500 });
  labelValue({ page, regular, bold, label: "Plan", value: input.planCode || "-", x: 48, y: 435 });
  labelValue({ page, regular, bold, label: "Billing cycle", value: input.billingCycle || "-", x: 300, y: 435 });
  labelValue({ page, regular, bold, label: "Dodo payment ID", value: input.reference, x: 48, y: 370 });
  labelValue({ page, regular, bold, label: "Provider invoice ID", value: input.providerInvoiceId || "-", x: 300, y: 370 });

  page.drawRectangle({
    x: 48,
    y: 235,
    width: 499,
    height: 72,
    borderColor: rgb(0.82, 0.87, 0.94),
    borderWidth: 1,
    color: rgb(0.98, 0.99, 1),
  });
  page.drawText("Payment processed securely by Dodo Payments.", {
    x: 66,
    y: 276,
    size: 10,
    font: bold,
    color: rgb(0.08, 0.12, 0.2),
  });
  page.drawText("This BuildEZ receipt reflects the captured provider transaction.", {
    x: 66,
    y: 254,
    size: 9,
    font: regular,
    color: rgb(0.39, 0.45, 0.55),
  });

  page.drawText("BuildEZ by Appwire LLP", {
    x: 48,
    y: 65,
    size: 9,
    font: regular,
    color: rgb(0.39, 0.45, 0.55),
  });
  page.drawText("Receipt generated from the recorded Dodo payment.", {
    x: 324,
    y: 65,
    size: 9,
    font: regular,
    color: rgb(0.39, 0.45, 0.55),
  });

  return pdf.save();
}
