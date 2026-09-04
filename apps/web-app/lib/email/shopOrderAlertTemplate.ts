import { renderEmailLayout, escapeHtml, BRAND_BLUE } from "./emailLayout";
import type { ShopOrderEmailItem } from "./shopOrderConfirmationTemplate";

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

type ShopOrderAlertOrder = {
  orderNumber: number;
  email: string;
  currency: string;
  total: unknown;
};

export function shopOrderAlertEmailContent(input: {
  order: ShopOrderAlertOrder;
  items: ShopOrderEmailItem[];
  shopName: string;
  ordersUrl: string;
}) {
  const { order, items, shopName, ordersUrl } = input;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = formatMoney(Number(order.total), order.currency);
  const subject = `New order #${order.orderNumber} on ${shopName}`;
  const text = `New order #${order.orderNumber} on ${shopName} from ${order.email} — ${itemCount} item(s), ${total}. View it: ${ordersUrl}`;

  const bodyHtml = `
    <h1 style="font-size:19px;font-weight:600;margin:0 0 12px;color:#12141a;">New order on ${escapeHtml(shopName)}</h1>
    <p style="font-size:14px;line-height:1.6;color:#5b6472;margin:0 0 20px;">
      You just received a new order.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f3f5;border-radius:12px;margin-bottom:20px;">
      <tr>
        <td style="padding:16px 18px;font-size:14px;color:#5b6472;">Order</td>
        <td style="padding:16px 18px;font-size:14px;color:#12141a;font-weight:600;text-align:right;">#${order.orderNumber}</td>
      </tr>
      <tr>
        <td style="padding:0 18px 16px;font-size:14px;color:#5b6472;">Customer</td>
        <td style="padding:0 18px 16px;font-size:14px;color:#12141a;font-weight:600;text-align:right;">${escapeHtml(order.email)}</td>
      </tr>
      <tr>
        <td style="padding:0 18px 16px;font-size:14px;color:#5b6472;">Items</td>
        <td style="padding:0 18px 16px;font-size:14px;color:#12141a;font-weight:600;text-align:right;">${itemCount}</td>
      </tr>
      <tr>
        <td style="padding:0 18px 16px;font-size:14px;color:#5b6472;">Total</td>
        <td style="padding:0 18px 16px;font-size:14px;color:#12141a;font-weight:600;text-align:right;">${total}</td>
      </tr>
    </table>
    <a href="${ordersUrl}" style="display:inline-block;background:${BRAND_BLUE};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:10px;">View order</a>
  `;
  const html = renderEmailLayout({ preheader: `New order #${order.orderNumber} — ${total}`, bodyHtml });
  return { subject, text, html };
}
