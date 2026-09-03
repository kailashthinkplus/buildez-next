import { renderEmailLayout, escapeHtml } from "./emailLayout";

type OtpPurpose = "reset your password" | "verify your email" | "sign in to your account";

export function otpEmailContent(input: { code: string; purpose: OtpPurpose; expiresInMinutes?: number }) {
  const minutes = input.expiresInMinutes ?? 10;
  const subject = `${input.code} is your BuildEZ verification code`;
  const text = `Your BuildEZ code to ${input.purpose} is ${input.code}. It expires in ${minutes} minutes. If you didn't request this, you can ignore this email.`;
  const bodyHtml = `
    <p style="font-size:14px;color:#5b6472;margin:0 0 20px;">Use this code to ${escapeHtml(input.purpose)}:</p>
    <div style="font-size:32px;font-weight:700;letter-spacing:.14em;text-align:center;padding:18px;border-radius:12px;background:#f2f3f5;margin-bottom:20px;color:#12141a;">${escapeHtml(input.code)}</div>
    <p style="font-size:13px;color:#5b6472;margin:0;">This code expires in ${minutes} minutes. If you didn't request this, you can safely ignore this email.</p>
  `;
  const html = renderEmailLayout({ preheader: `Your code: ${input.code}`, bodyHtml });
  return { subject, text, html };
}
