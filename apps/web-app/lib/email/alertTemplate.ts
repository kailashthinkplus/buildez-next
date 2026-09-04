import { renderEmailLayout, escapeHtml, BRAND_BLUE } from "./emailLayout";

/**
 * General-purpose transactional alert: a title, a message, and an
 * optional call-to-action. Use this for anything that doesn't warrant
 * its own dedicated template (low credit balance, security notices,
 * one-off account alerts) rather than growing a new template per case.
 */
export function alertEmailContent(input: {
  title: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) {
  const subject = input.title;
  const text = input.ctaUrl ? `${input.message}\n\n${input.ctaLabel || "Open BuildEZ"}: ${input.ctaUrl}` : input.message;
  const cta = input.ctaUrl
    ? `<a href="${input.ctaUrl}" style="display:inline-block;background:${BRAND_BLUE};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:10px;">${escapeHtml(input.ctaLabel || "Open BuildEZ")}</a>`
    : "";
  const bodyHtml = `
    <h1 style="font-size:19px;font-weight:600;margin:0 0 12px;color:#12141a;">${escapeHtml(input.title)}</h1>
    <p style="font-size:14px;line-height:1.6;color:#5b6472;margin:0 0 20px;white-space:pre-line;">${escapeHtml(input.message)}</p>
    ${cta}
  `;
  const html = renderEmailLayout({ preheader: input.title, bodyHtml });
  return { subject, text, html };
}
