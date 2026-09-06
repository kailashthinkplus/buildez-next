const BRAND_BLUE = "#1349A3";

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.PLATFORM_DOMAIN || "getbuildezy.com"}`).replace(/\/$/, "");
}

/**
 * Shared branded HTML shell every transactional email renders inside —
 * table-based layout (email-client-safe, not flexbox/grid), logo hosted
 * as a real PNG at a public URL (SVG support is unreliable across email
 * clients, especially Outlook). Callers supply just the body content.
 */
export function renderEmailLayout(input: { preheader?: string; bodyHtml: string }): string {
  const logoUrl = `${appUrl()}/emails/buildez-logo.png`;
  const preheader = input.preheader || "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Build Ezy</title>
</head>
<body style="margin:0;padding:0;background-color:#f2f3f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f3f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:28px 32px 20px;">
              <img src="${logoUrl}" alt="Build Ezy" width="140" height="45" style="display:block;width:140px;height:auto;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:4px 32px 32px;color:#12141a;">
              ${input.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:#f8f9fb;border-top:1px solid #eef0f3;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#8a93a3;">
                Sent by Build Ezy &middot; Need help? Contact
                <a href="mailto:support@getbuildezy.com" style="color:${BRAND_BLUE};text-decoration:none;">support@getbuildezy.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export { BRAND_BLUE };
