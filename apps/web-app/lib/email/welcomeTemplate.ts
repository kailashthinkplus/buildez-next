import { renderEmailLayout, escapeHtml, BRAND_BLUE } from "./emailLayout";

const BANNER_URL = "https://assets.getbuildez.com/marketing/homepage/hero/developer-building.webp";

function nextStepRow(input: { title: string; body: string; href: string; label: string }) {
  return `
    <tr>
      <td style="padding:14px 0;border-top:1px solid #eef0f3;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;">
              <p style="margin:0 0 3px;font-size:13px;font-weight:600;color:#12141a;">${escapeHtml(input.title)}</p>
              <p style="margin:0;font-size:12.5px;line-height:1.5;color:#5b6472;">${escapeHtml(input.body)}</p>
            </td>
            <td style="vertical-align:top;text-align:right;white-space:nowrap;padding-left:16px;">
              <a href="${input.href}" style="font-size:12.5px;font-weight:600;color:${BRAND_BLUE};text-decoration:none;">${escapeHtml(input.label)} &rarr;</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

export function welcomeEmailContent(input: {
  firstName?: string | null;
  continueUrl: string;
  dashboardUrl?: string;
  templatesUrl?: string;
  supportUrl?: string;
}) {
  const name = input.firstName?.trim();
  const greeting = name ? `Welcome, ${name}!` : "Welcome to Build Ezy!";
  const subject = "Welcome to Build Ezy";
  const text = `${greeting} Your account is ready. Continue setting up your website: ${input.continueUrl}`;

  const dashboardUrl = input.dashboardUrl || input.continueUrl;
  const templatesUrl = input.templatesUrl || input.continueUrl;
  const supportUrl = input.supportUrl || "mailto:support@getbuildezy.com";

  const bodyHtml = `
    <img
      src="${BANNER_URL}"
      alt="A developer building a website with Build Ezy"
      width="416"
      style="display:block;width:100%;max-width:416px;height:auto;border:0;border-radius:12px;margin:0 0 22px;"
    />
    <h1 style="font-size:19px;font-weight:600;margin:0 0 12px;color:#12141a;">${escapeHtml(greeting)}</h1>
    <p style="font-size:14px;line-height:1.6;color:#5b6472;margin:0 0 22px;">
      Your account is ready. Pick up where you left off and finish setting up your website.
    </p>
    <a href="${input.continueUrl}" style="display:inline-block;background:${BRAND_BLUE};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:10px;margin-bottom:8px;">Continue setup</a>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;">
      <tr>
        <td style="padding-bottom:2px;">
          <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#8a93a3;">Get started</p>
        </td>
      </tr>
      ${nextStepRow({
        title: "Design your website",
        body: "Shape every section visually or let AI generate a first draft from a short description.",
        href: dashboardUrl,
        label: "Open builder",
      })}
      ${nextStepRow({
        title: "Browse templates",
        body: "Start faster with a layout built for your kind of business.",
        href: templatesUrl,
        label: "See templates",
      })}
      ${nextStepRow({
        title: "Need a hand?",
        body: "Our team can help with setup, domains, or anything in between.",
        href: supportUrl,
        label: "Contact support",
      })}
    </table>
  `;
  const html = renderEmailLayout({ preheader: greeting, bodyHtml });
  return { subject, text, html };
}
