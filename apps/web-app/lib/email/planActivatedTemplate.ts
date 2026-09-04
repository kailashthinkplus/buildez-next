import { renderEmailLayout, escapeHtml, BRAND_BLUE } from "./emailLayout";

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function planActivatedEmailContent(input: {
  planName: string;
  billingCycle: string;
  amount: number;
  currency: string;
  manageUrl: string;
}) {
  const price = formatMoney(input.amount, input.currency);
  const cycle = input.billingCycle === "yearly" ? "year" : "month";
  const subject = `Your ${input.planName} plan is active`;
  const text = `Your BuildEZ ${input.planName} plan is now active — ${price}/${cycle}. Manage your subscription: ${input.manageUrl}`;
  const bodyHtml = `
    <h1 style="font-size:19px;font-weight:600;margin:0 0 12px;color:#12141a;">You're all set 🎉</h1>
    <p style="font-size:14px;line-height:1.6;color:#5b6472;margin:0 0 20px;">
      Your <strong style="color:#12141a;">${escapeHtml(input.planName)}</strong> plan is now active.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f3f5;border-radius:12px;margin-bottom:20px;">
      <tr>
        <td style="padding:16px 18px;font-size:14px;color:#5b6472;">Plan</td>
        <td style="padding:16px 18px;font-size:14px;color:#12141a;font-weight:600;text-align:right;">${escapeHtml(input.planName)}</td>
      </tr>
      <tr>
        <td style="padding:0 18px 16px;font-size:14px;color:#5b6472;">Billing</td>
        <td style="padding:0 18px 16px;font-size:14px;color:#12141a;font-weight:600;text-align:right;">${price} / ${cycle}</td>
      </tr>
    </table>
    <a href="${input.manageUrl}" style="display:inline-block;background:${BRAND_BLUE};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:10px;">Manage your plan</a>
  `;
  const html = renderEmailLayout({ preheader: `Your ${input.planName} plan is now active.`, bodyHtml });
  return { subject, text, html };
}
