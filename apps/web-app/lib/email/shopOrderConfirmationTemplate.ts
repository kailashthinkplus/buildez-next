import { renderEmailLayout, escapeHtml } from "./emailLayout";

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export type ShopOrderEmailItem = {
  title: string;
  variantTitle?: string | null;
  sku?: string | null;
  quantity: number;
  unitPrice: unknown;
  total: unknown;
};

type ShopOrderEmailOrder = {
  orderNumber: number;
  currency: string;
  subtotal: unknown;
  discount: unknown;
  shipping: unknown;
  tax: unknown;
  total: unknown;
  shippingAddress: unknown;
};

function formatAddress(address: unknown) {
  const a = (address || {}) as Record<string, string | undefined>;
  const cityLine = [a.city, a.state, a.postalCode || a.zip].filter(Boolean).join(", ");
  return [a.name, a.line1 || a.address1, a.line2 || a.address2, cityLine, a.country]
    .filter((line): line is string => Boolean(line))
    .map((line) => escapeHtml(line))
    .join("<br/>");
}

function itemRow(item: ShopOrderEmailItem, currency: string) {
  const variant = item.variantTitle ? `<br/><span style="color:#8a93a3;font-size:12px;">${escapeHtml(item.variantTitle)}</span>` : "";
  return `
    <tr>
      <td style="padding:10px 18px;font-size:14px;color:#12141a;border-top:1px solid #e5e7eb;">${escapeHtml(item.title)}${variant}</td>
      <td style="padding:10px 18px;font-size:14px;color:#5b6472;text-align:center;border-top:1px solid #e5e7eb;">${item.quantity}</td>
      <td style="padding:10px 18px;font-size:14px;color:#12141a;text-align:right;border-top:1px solid #e5e7eb;">${formatMoney(Number(item.total), currency)}</td>
    </tr>`;
}

function summaryRow(label: string, amount: number, currency: string, bold = false) {
  const weight = bold ? "font-weight:600;" : "";
  return `
    <tr>
      <td colspan="2" style="padding:6px 18px;font-size:14px;color:#5b6472;${weight}">${label}</td>
      <td style="padding:6px 18px;font-size:14px;color:#12141a;text-align:right;${weight}">${formatMoney(amount, currency)}</td>
    </tr>`;
}

export function shopOrderConfirmationEmailContent(input: { order: ShopOrderEmailOrder; items: ShopOrderEmailItem[]; shopName: string }) {
  const { order, items, shopName } = input;
  const subject = `Order #${order.orderNumber} confirmed`;
  const text = `Thanks for your order from ${shopName}! Order #${order.orderNumber} is confirmed — total ${formatMoney(Number(order.total), order.currency)}. We'll email you again once it ships.`;

  const bodyHtml = `
    <h1 style="font-size:19px;font-weight:600;margin:0 0 12px;color:#12141a;">Thanks for your order!</h1>
    <p style="font-size:14px;line-height:1.6;color:#5b6472;margin:0 0 20px;">
      Your order <strong style="color:#12141a;">#${order.orderNumber}</strong> from <strong style="color:#12141a;">${escapeHtml(shopName)}</strong> is confirmed. We'll let you know as soon as it ships.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f3f5;border-radius:12px;margin-bottom:20px;overflow:hidden;">
      <tr>
        <td style="padding:10px 18px;font-size:12px;font-weight:600;color:#8a93a3;text-transform:uppercase;">Item</td>
        <td style="padding:10px 18px;font-size:12px;font-weight:600;color:#8a93a3;text-transform:uppercase;text-align:center;">Qty</td>
        <td style="padding:10px 18px;font-size:12px;font-weight:600;color:#8a93a3;text-transform:uppercase;text-align:right;">Total</td>
      </tr>
      ${items.map((item) => itemRow(item, order.currency)).join("")}
      ${summaryRow("Subtotal", Number(order.subtotal), order.currency)}
      ${Number(order.discount) > 0 ? summaryRow("Discount", -Number(order.discount), order.currency) : ""}
      ${summaryRow("Shipping", Number(order.shipping), order.currency)}
      ${Number(order.tax) > 0 ? summaryRow("Tax", Number(order.tax), order.currency) : ""}
      ${summaryRow("Total", Number(order.total), order.currency, true)}
    </table>
    <p style="font-size:12px;font-weight:600;color:#8a93a3;text-transform:uppercase;margin:0 0 6px;">Shipping to</p>
    <p style="font-size:14px;line-height:1.6;color:#5b6472;margin:0 0 20px;">${formatAddress(order.shippingAddress)}</p>
    <p style="font-size:13px;line-height:1.6;color:#8a93a3;margin:0;">We'll send another email once your order ships.</p>
  `;
  const html = renderEmailLayout({ preheader: `Order #${order.orderNumber} confirmed — ${formatMoney(Number(order.total), order.currency)}`, bodyHtml });
  return { subject, text, html };
}
