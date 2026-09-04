import { renderEmailLayout, escapeHtml, BRAND_BLUE } from "./emailLayout";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
}

/**
 * Two variants sharing one template: a plan scheduled to renew (billing
 * transparency — reduces surprise-charge disputes) vs. a plan the user
 * already cancelled that's about to actually end (retention nudge, and a
 * clear heads-up before they lose access).
 */
export function subscriptionExpiryEmailContent(input: {
  planName: string;
  periodEnd: Date;
  cancelAtPeriodEnd: boolean;
  manageUrl: string;
}) {
  const dateLabel = formatDate(input.periodEnd);

  if (input.cancelAtPeriodEnd) {
    const subject = `Your ${input.planName} plan ends on ${dateLabel}`;
    const text = `Your BuildEZ ${input.planName} plan is scheduled to end on ${dateLabel} and won't renew. Change your mind? ${input.manageUrl}`;
    const bodyHtml = `
      <h1 style="font-size:19px;font-weight:600;margin:0 0 12px;color:#12141a;">Your plan ends soon</h1>
      <p style="font-size:14px;line-height:1.6;color:#5b6472;margin:0 0 20px;">
        Your <strong style="color:#12141a;">${escapeHtml(input.planName)}</strong> plan is scheduled to end on
        <strong style="color:#12141a;">${dateLabel}</strong> and won't renew. You'll keep full access until then.
      </p>
      <a href="${input.manageUrl}" style="display:inline-block;background:${BRAND_BLUE};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:10px;">Keep my plan</a>
    `;
    const html = renderEmailLayout({ preheader: `Your ${input.planName} plan ends on ${dateLabel}.`, bodyHtml });
    return { subject, text, html };
  }

  const subject = `Your ${input.planName} plan renews on ${dateLabel}`;
  const text = `Your BuildEZ ${input.planName} plan will renew on ${dateLabel}. Manage your subscription: ${input.manageUrl}`;
  const bodyHtml = `
    <h1 style="font-size:19px;font-weight:600;margin:0 0 12px;color:#12141a;">Your plan renews soon</h1>
    <p style="font-size:14px;line-height:1.6;color:#5b6472;margin:0 0 20px;">
      Your <strong style="color:#12141a;">${escapeHtml(input.planName)}</strong> plan will automatically renew on
      <strong style="color:#12141a;">${dateLabel}</strong>. No action is needed.
    </p>
    <a href="${input.manageUrl}" style="display:inline-block;background:${BRAND_BLUE};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:10px;">Manage your plan</a>
  `;
  const html = renderEmailLayout({ preheader: `Your ${input.planName} plan renews on ${dateLabel}.`, bodyHtml });
  return { subject, text, html };
}
