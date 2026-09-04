import { renderEmailLayout, escapeHtml, BRAND_BLUE } from "./emailLayout";

export function welcomeEmailContent(input: { firstName?: string | null; continueUrl: string }) {
  const name = input.firstName?.trim();
  const greeting = name ? `Welcome, ${name}!` : "Welcome to BuildEZ!";
  const subject = "Welcome to BuildEZ";
  const text = `${greeting} Your account is ready. Continue setting up your website: ${input.continueUrl}`;
  const bodyHtml = `
    <h1 style="font-size:19px;font-weight:600;margin:0 0 12px;color:#12141a;">${escapeHtml(greeting)}</h1>
    <p style="font-size:14px;line-height:1.6;color:#5b6472;margin:0 0 20px;">
      Your account is ready. Pick up where you left off and finish setting up your website.
    </p>
    <a href="${input.continueUrl}" style="display:inline-block;background:${BRAND_BLUE};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:10px;">Continue setup</a>
  `;
  const html = renderEmailLayout({ preheader: greeting, bodyHtml });
  return { subject, text, html };
}
