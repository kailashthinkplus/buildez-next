import { sendMail } from "./sendMail";
import { alertEmailContent } from "./alertTemplate";

/**
 * Single destination for every platform-side notification (contact form
 * submissions, bug/abuse reports, future ops alerts) — one place to change
 * if the inbox that monitors BuildEZ ever moves.
 */
export const ADMIN_ALERT_EMAIL = process.env.ADMIN_ALERT_EMAIL || "support@getbuildezy.com";

export async function sendAdminAlert(input: { title: string; message: string; ctaLabel?: string; ctaUrl?: string }) {
  const { subject, text, html } = alertEmailContent(input);
  // Never let a notification failure break the caller's request/response.
  return sendMail({ to: ADMIN_ALERT_EMAIL, subject, text, html }).catch((error) => {
    console.error("ADMIN ALERT EMAIL FAILED:", error);
    return { delivered: false };
  });
}
